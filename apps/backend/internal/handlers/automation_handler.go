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
		Event  string                 `json:"event"`
		Key    string                 `json:"key"`
		Value  string                 `json:"value"`
		Output map[string]interface{} `json:"output"`
		// Legacy support in same endpoint? Optional.
		// Legacy support in same endpoint? Optional.
		ActionID string `json:"action_id"`
		FlowID   string `json:"flow_id"`
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
	if payload.Key == "" || payload.Value == "" {
		http.Error(w, "key and value are required for correlation signal", http.StatusBadRequest)
		return
	}
	if payload.Event == "" {
		payload.Event = "default"
	}

	client := database.GetClient()
	var subscriptions []struct {
		ID         string `json:"id"`
		WorkflowID string `json:"workflow_id"`
		RunID      string `json:"run_id"`
		StepID     string `json:"step_id"`
	}

	// Find active subscriptions
	query := client.DB.From("automation_subscriptions").
		Select("id, workflow_id, run_id, step_id").
		Eq("event_name", payload.Event).
		Eq("correlation_key", payload.Key).
		Eq("correlation_value", payload.Value).
		Eq("status", "active")

	if payload.FlowID != "" {
		query = query.Eq("flow_id", payload.FlowID)
	}

	err := query.Execute(&subscriptions)

	if err != nil {
		fmt.Printf("DEBUG: Subscription lookup failed: %v\n", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if len(subscriptions) == 0 {
		// 200 OK but 0 resumed
		json.NewEncoder(w).Encode(map[string]any{"status": "ok", "resumed": 0, "message": "No active subscriptions found"})
		return
	}

	resumedCount := 0
	for _, sub := range subscriptions {
		// Construct ActionID
		actionID := fmt.Sprintf("%s:%s", sub.RunID, sub.StepID)
		signalName := "AutomationSignal-" + actionID

		signalArg := map[string]interface{}{
			"action_id": actionID,
			"output":    payload.Output,
		}

		// Signal Workflow
		err := h.TemporalClient.SignalWorkflow(r.Context(), sub.WorkflowID, sub.RunID, signalName, signalArg)
		if err != nil {
			fmt.Printf("ERROR: Failed to signal workflow %s: %v\n", sub.WorkflowID, err)
			continue
		}

		// Mark subscription as completed
		// We do this asynchronously or simply here. Ideally in a transaction but Supabase REST doesn't support easy tx across calls.
		// "At least once" delivery is better than "At most once", so maybe mark complete AFTER signal.
		// If signal fails, we retry later? For now, just log error.
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
