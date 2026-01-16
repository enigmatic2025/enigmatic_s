package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"go.temporal.io/sdk/client"
)

type ExecuteFlowHandler struct {
	TemporalClient client.Client
}

func NewExecuteFlowHandler(c client.Client) *ExecuteFlowHandler {
	return &ExecuteFlowHandler{
		TemporalClient: c,
	}
}

// ExecuteFlow starts a new instance of a flow
// POST /flows/{flow_id}/execute
func (h *ExecuteFlowHandler) ExecuteFlow(w http.ResponseWriter, r *http.Request) {
	// 1. Extract Flow ID
	pathParts := strings.Split(r.URL.Path, "/")
	// Expected: /flows/{id}/execute -> ["", "flows", "ID", "execute"]
	if len(pathParts) < 4 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	flowID := pathParts[2]

	// 2. Parse Body
	var inputData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&inputData); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	// 3. Fetch Flow Definition
	// We need the 'published_definition' ideally, but for now we'll use 'draft_definition' if published is missing
	// or just 'definition' based on the Dual-Write strategy.
	dbClient := database.GetClient()
	var flow struct {
		ID              string                 `json:"id"`
		Name            string                 `json:"name"`
		Definition      map[string]interface{} `json:"definition"` // Compatibility column
		VariablesSchema []interface{}          `json:"variables_schema"`
	}

	err := dbClient.DB.From("flows").Select("id, name, definition, variables_schema").Eq("id", flowID).Single().Execute(&flow)
	if err != nil {
		http.Error(w, "Flow not found: "+err.Error(), http.StatusNotFound)
		return
	}

	// 4. Validate Schema (Basic enforcement)
	// TODO: Iterate over flow.Definition nodes to find the 'api-trigger' and check its 'schema'.
	// For MVP, we just accept the payload as is.

	// 4a. Inject Flow ID into Definition for the Workflow to use
	if flow.Definition == nil {
		flow.Definition = make(map[string]interface{})
	}
	flow.Definition["id"] = flow.ID

	// 5. Generate Temporal Workflow ID
	// Use an idempotency key if provided, otherwise random
	idempotencyKey := r.Header.Get("X-Idempotency-Key")
	var workflowID string
	if idempotencyKey != "" {
		workflowID = fmt.Sprintf("flow-%s-%s", flowID, idempotencyKey)
	} else {
		// New unique run every time
		workflowID = fmt.Sprintf("flow-%s-%d", flowID, SystemTimeNow())
	}

	// 6. Start Workflow
	workflowOptions := client.StartWorkflowOptions{
		ID:        workflowID,
		TaskQueue: "FLOW_TASK_QUEUE", // Must match worker
	}

	// The workflow name must match what the worker registered.
	// Assuming "FlowExecutionWorkflow" is the name.
	we, err := h.TemporalClient.ExecuteWorkflow(context.Background(), workflowOptions, "FlowExecutionWorkflow", flow.Definition, inputData)
	if err != nil {
		http.Error(w, "Failed to start workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 7. Record Action Flow in DB (Optional, or done by Workflow itself)
	// Ideally the Workflow should record its own start in 'action_flows' table so it's consistent.
	// But we can return the RunID immediately.

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "Flow execution started",
		"workflow_id": we.GetID(),
		"run_id":      we.GetRunID(),
	})
}

// Simple helper for unique IDs if needed
func SystemTimeNow() int64 {
	return time.Now().UnixNano()
}
