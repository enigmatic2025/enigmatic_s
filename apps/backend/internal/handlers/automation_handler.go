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

// ResumeAutomationHandler resumes a paused automation node
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

	// Helper: Parse ActionID "run_id:node_id"
	parts := strings.Split(payload.ActionID, ":")
	if len(parts) != 2 {
		http.Error(w, "Invalid action_id format. Expected 'run_id:node_id'", http.StatusBadRequest)
		return
	}
	runID := parts[0]
	// nodeID := parts[1]

	// 1. Lookup WorkflowID from Action Flow
	client := database.GetClient()
	var actionFlow []struct {
		TemporalWorkflowID string `json:"temporal_workflow_id"`
		RunID              string `json:"run_id"`
	}
	err := client.DB.From("action_flows").Select("temporal_workflow_id, run_id").Eq("run_id", runID).Execute(&actionFlow)
	if err != nil || len(actionFlow) == 0 {
		fmt.Printf("DEBUG: Automation Resume Failed. RunID=%s, Err=%v\n", runID, err)
		http.Error(w, "Action flow execution not found", http.StatusNotFound)
		return
	}
	workflowID := actionFlow[0].TemporalWorkflowID

	// 2. Signal Workflow
	signalName := "AutomationSignal-" + payload.ActionID
	// The signal payload matches what the workflow expects: a map with "output" or flat keys
	// We'll pass the whole payload.Output
	signalArg := map[string]interface{}{
		"action_id": payload.ActionID,
		"output":    payload.Output,
	}

	err = h.TemporalClient.SignalWorkflow(r.Context(), workflowID, runID, signalName, signalArg)
	if err != nil {
		fmt.Printf("DEBUG: SignalWorkflow FAILED: %v\n", err)
		http.Error(w, "Failed to signal workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("DEBUG: Automation Resumed. Signal=%s\n", signalName)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
