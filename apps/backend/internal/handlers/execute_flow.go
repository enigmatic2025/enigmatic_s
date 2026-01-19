package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/workflow"
	"go.temporal.io/sdk/client"
)

type ExecutionHandler struct {
	TemporalClient client.Client
}

func NewExecutionHandler(c client.Client) *ExecutionHandler {
	return &ExecutionHandler{TemporalClient: c}
}

// ExecuteFlow handles the execution of a flow by ID
func (h *ExecutionHandler) ExecuteFlow(w http.ResponseWriter, r *http.Request) {
	// 1. Parse Flow ID from URL
	// Handles paths like /flows/{id}/execute
	parts := strings.Split(r.URL.Path, "/")
	// Expected parts: ["", "flows", "{id}", "execute"]
	if len(parts) < 4 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	flowID := parts[2]

	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	// 2. Parse Input Data from Body
	var req struct {
		Input map[string]interface{} `json:"input"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	inputData := req.Input

	// 3. Fetch Flow Definition from DB
	dbClient := database.GetClient()

	// We use a temporary struct to capture the DB result
	var dbResult []struct {
		Definition json.RawMessage `json:"definition"`
	}

	err := dbClient.DB.From("flows").Select("definition").Eq("id", flowID).Execute(&dbResult)
	if err != nil || len(dbResult) == 0 {
		http.Error(w, "Flow not found", http.StatusNotFound)
		return
	}

	// Deserialize definition into workflow.FlowDefinition
	var flowDef workflow.FlowDefinition
	if err := json.Unmarshal(dbResult[0].Definition, &flowDef); err != nil {
		http.Error(w, "Invalid flow definition in database", http.StatusInternalServerError)
		return
	}

	// 4. Setup Temporal Options
	workflowOptions := client.StartWorkflowOptions{
		ID:        "flow-" + flowID + "-" + fmt.Sprintf("%d", time.Now().UnixNano()),
		TaskQueue: "nodal-task-queue",
	}

	// 5. Execute Workflow
	// Use the function reference to ensure type safety and correct name matching
	// This also implicitly enforces the 2-argument signature (FlowDefinition, InputData)
	we, err := h.TemporalClient.ExecuteWorkflow(context.Background(), workflowOptions, workflow.NodalWorkflow, flowDef, inputData)
	if err != nil {
		http.Error(w, "Failed to start workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 6. Record Action Flow in DB (Optional, or done by Workflow itself)
	// Idealy the Workflow should record its own start in 'action_flows' table so it's consistent.
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
