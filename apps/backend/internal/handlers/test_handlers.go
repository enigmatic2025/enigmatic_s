package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/nodes"
	"github.com/teavana/enigmatic_s/apps/backend/internal/workflow"
	"go.temporal.io/sdk/client"
)

// TestNodeRequest is the payload for testing a single node.
type TestNodeRequest struct {
	Type   string                 `json:"type"`
	Config map[string]interface{} `json:"config"`
	Input  map[string]interface{} `json:"input"`
}

// TestNodeHandler executes a node directly (bypassing Temporal) for quick testing.
func TestNodeHandler(w http.ResponseWriter, r *http.Request) {
	var req TestNodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Ensure type is in config for the executor lookup
	if req.Config == nil {
		req.Config = make(map[string]interface{})
	}
	req.Config["type"] = req.Type

	// Construct context
	nodeCtx := nodes.NodeContext{
		WorkflowID: "test-workflow",
		StepID:     "test-step",
		InputData:  req.Input,
		Config:     req.Config,
	}

	// Get Executor
	executor, err := nodes.GetExecutor(req.Type)
	if err != nil {
		http.Error(w, "Unknown node type: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Execute
	result, err := executor.Execute(r.Context(), nodeCtx)
	if err != nil {
		http.Error(w, "Execution failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// TestFlowRequest is the payload for testing a flow.
type TestFlowRequest struct {
	FlowDefinition interface{} `json:"flow_definition"`
}

// TestFlowHandler triggers a Temporal workflow.
func TestFlowHandler(w http.ResponseWriter, r *http.Request) {
	var req TestFlowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Connect to Temporal
	c, err := client.Dial(client.Options{})
	if err != nil {
		http.Error(w, "Failed to connect to Temporal", http.StatusInternalServerError)
		return
	}
	defer c.Close()

	options := client.StartWorkflowOptions{
		ID:        "test-flow-" + generateID(), // Helper needed or use UUID
		TaskQueue: "nodal-task-queue",
	}

	we, err := c.ExecuteWorkflow(r.Context(), options, workflow.NodalWorkflow, req.FlowDefinition)
	if err != nil {
		http.Error(w, "Failed to start workflow", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"workflow_id": we.GetID(),
		"run_id":      we.GetRunID(),
	})
}

func generateID() string {
	// Simple timestamp for now
	return "gen-id" 
}
