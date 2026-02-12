package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"go.temporal.io/sdk/client"
)

type AutomationHandler struct {
	TemporalClient client.Client
}

func NewAutomationHandler(temporalClient client.Client) *AutomationHandler {
	return &AutomationHandler{
		TemporalClient: temporalClient,
	}
}

// ResumeAutomationHandler resumes a paused automation node via ActionID
// POST /api/automation/resume
func (h *AutomationHandler) ResumeAutomationHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		ActionID string                 `json:"action_id"`
		Output   map[string]interface{} `json:"output"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if payload.ActionID == "" {
		http.Error(w, "action_id is required", http.StatusBadRequest)
		return
	}

	h.resumeByActionID(w, r, payload.ActionID, payload.Output)
}

// SignalAutomationHandler resumes paused automation nodes via Correlation Key
// POST /api/automation/signal
func (h *AutomationHandler) SignalAutomationHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Event string `json:"event"`
		// Legacy: Key/Value
		Key   string `json:"key"`
		Value string `json:"value"`
		// Modern: Data map
		Data map[string]interface{} `json:"data"`

		Output   map[string]interface{} `json:"output"`
		ActionID string                 `json:"action_id"`
		FlowID   string                 `json:"flow_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	// 1. Direct ActionID (Legacy/Fallback)
	if payload.ActionID != "" {
		h.resumeByActionID(w, r, payload.ActionID, payload.Output)
		return
	}

	// 2. Correlation
	if payload.Event == "" {
		payload.Event = "default"
	}

	// Normalize Payload Data
	if payload.Data == nil {
		payload.Data = make(map[string]interface{})
	}
	// Merge legacy Key/Value into Data if present
	if payload.Key != "" && payload.Value != "" {
		payload.Data[payload.Key] = payload.Value
	}

	if len(payload.Data) == 0 {
		http.Error(w, "data or key/value required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	type DBSubscription struct {
		ID         string                 `json:"id"`
		WorkflowID string                 `json:"workflow_id"`
		RunID      string                 `json:"run_id"`
		StepID     string                 `json:"step_id"`
		Criteria   map[string]interface{} `json:"criteria"`
	}
	var subscriptions []DBSubscription

	// Find active subscriptions by Event Name
	query := client.DB.From("automation_subscriptions").
		Select("id, workflow_id, run_id, step_id, criteria").
		Eq("event_name", payload.Event).
		Eq("status", "active")

	// Optional Flow Scope
	if payload.FlowID != "" {
		query = query.Eq("flow_id", payload.FlowID)
	}

	err := query.Execute(&subscriptions)

	if err != nil {
		fmt.Printf("DEBUG: Subscription lookup failed: %v\n", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	resumedCount := 0
	for _, sub := range subscriptions {
		// IN-MEMORY MATCHING: Check if Subscription Criteria is a SUBSET of Payload Data
		// All keys in Criteria must exist in Payload Data and have matching values
		match := true
		for k, v := range sub.Criteria {
			payloadVal, exists := payload.Data[k]
			if !exists {
				match = false
				break
			}
			// Simple string comparison for now.
			// In production, might want deeper equality checks for numbers/bools.
			if fmt.Sprintf("%v", payloadVal) != fmt.Sprintf("%v", v) {
				match = false
				break
			}
		}

		if !match {
			continue
		}

		// MATCH FOUND!

		// Construct ActionID
		actionID := fmt.Sprintf("%s:%s", sub.RunID, sub.StepID)
		signalName := "AutomationSignal-" + actionID

		signalArg := map[string]interface{}{
			"action_id": actionID,
			"output":    payload.Output,
			"data":      payload.Data, // Pass full data to flow context
		}

		// Signal Workflow
		err := h.TemporalClient.SignalWorkflow(r.Context(), sub.WorkflowID, sub.RunID, signalName, signalArg)
		if err != nil {
			fmt.Printf("ERROR: Failed to signal workflow %s: %v\n", sub.WorkflowID, err)
			continue
		}

		// Mark subscription as completed
		client.DB.From("automation_subscriptions").
			Update(map[string]any{"status": "completed"}).
			Eq("id", sub.ID).
			Execute(nil)

		resumedCount++
	}

	json.NewEncoder(w).Encode(map[string]any{
		"status":  "ok",
		"resumed": resumedCount,
	})
}

// Helper for direct resumption
func (h *AutomationHandler) resumeByActionID(w http.ResponseWriter, r *http.Request, actionID string, output map[string]interface{}) {
	parts := strings.Split(actionID, ":")
	if len(parts) != 2 {
		http.Error(w, "Invalid action_id format. Expected 'run_id:node_id'", http.StatusBadRequest)
		return
	}
	runID := parts[0]

	// Lookup WorkflowID
	dbClient := database.GetClient()
	var actionFlow []struct {
		TemporalWorkflowID string `json:"temporal_workflow_id"`
	}
	err := dbClient.DB.From("action_flows").Select("temporal_workflow_id").Eq("run_id", runID).Execute(&actionFlow)
	if err != nil || len(actionFlow) == 0 {
		http.Error(w, "Action flow execution not found", http.StatusNotFound)
		return
	}
	workflowID := actionFlow[0].TemporalWorkflowID

	// Signal
	signalName := "AutomationSignal-" + actionID
	signalArg := map[string]interface{}{
		"action_id": actionID,
		"output":    output,
	}

	err = h.TemporalClient.SignalWorkflow(r.Context(), workflowID, runID, signalName, signalArg)
	if err != nil {
		http.Error(w, "Failed to signal workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
