package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

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
		fmt.Printf("Node execution failed: %v\n", err)
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
	hostPort := os.Getenv("TEMPORAL_HOST_PORT")
	if hostPort == "" {
		hostPort = "127.0.0.1:7233"
	}

	// Create a simple logger to suppress the warning
	logger := &SimpleLogger{}

	c, err := client.Dial(client.Options{
		HostPort: hostPort,
		Logger:   logger,
	})
	if err != nil {
		fmt.Printf("Failed to connect to Temporal at %s: %v\n", hostPort, err)
		http.Error(w, "Failed to connect to Temporal", http.StatusInternalServerError)
		return
	}
	defer c.Close()

	options := client.StartWorkflowOptions{
		ID:        "test-flow-" + generateID(), // Helper needed or use UUID
		TaskQueue: "nodal-task-queue",
	}

	// Convert the generic map to a strict FlowDefinition struct
	// This ensures we validate the structure BEFORE sending to Temporal
	// and solves the mismatch between 'interface{}' and 'FlowDefinition'
	flowDefJson, err := json.Marshal(req.FlowDefinition)
	if err != nil {
		http.Error(w, "Invalid flow definition format", http.StatusBadRequest)
		return
	}

	var flowDef workflow.FlowDefinition
	if err := json.Unmarshal(flowDefJson, &flowDef); err != nil {
		fmt.Printf("Failed to parse flow definition: %v\n", err)
		http.Error(w, "Invalid flow definition structure", http.StatusBadRequest)
		return
	}

	we, err := c.ExecuteWorkflow(r.Context(), options, workflow.NodalWorkflow, flowDef)
	if err != nil {
		fmt.Printf("Failed to start workflow: %v\n", err)
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
	b := make([]byte, 8)
	_, err := rand.Read(b)
	if err != nil {
		return fmt.Sprintf("gen-%d", time.Now().UnixNano())
	}
	return fmt.Sprintf("gen-%x", b)
}

// GetFlowResultHandler checks the status of a workflow run
func GetFlowResultHandler(w http.ResponseWriter, r *http.Request) {
	// Extract RunID from path: /api/test/flow/{runID}
	// Since we used HandleFunc with specific pattern in main, we might need manual parsing
	// or if we use Go 1.22 path vars.
	// Assuming standard library for now, let's just grab the last segment.

	// Simplistic ID extraction from URL
	// Simplistic ID extraction from URL
	path := r.URL.Path // e.g. /api/test/flow/RunID

	fmt.Printf("DEBUG: Full Request URL: %s, RawQuery: %s\n", r.URL.String(), r.URL.RawQuery)

	runID := strings.TrimPrefix(path, "/api/test/flow/")

	fmt.Printf("DEBUG: GetFlowResultHandler - Path: %s, Extracted RunID: %s\n", path, runID)

	if runID == "" || runID == path { // check if replacement happened
		// Try alternative if prefix was missed (e.g. if behind functionality)
		// But for now just log it.
		fmt.Printf("ERROR: Missing Run ID. Path was %s\n", path)
		http.Error(w, fmt.Sprintf("Missing Run ID. Path: %s", path), http.StatusBadRequest)
		return
	}

	// Connect to Temporal
	hostPort := os.Getenv("TEMPORAL_HOST_PORT")
	if hostPort == "" {
		hostPort = "127.0.0.1:7233"
	}

	logger := &SimpleLogger{}

	c, err := client.Dial(client.Options{
		HostPort: hostPort,
		Logger:   logger,
	})
	if err != nil {
		http.Error(w, "Failed to connect to Temporal", http.StatusInternalServerError)
		return
	}
	defer c.Close()

	workflowID := "" // We might need this, or we can look up by RunID if we know the WorkflowID logic.
	// NOTE: In Temporal, you usually need WorkflowID AND RunID.
	// Our generateID() makes the WorkflowID "test-flow-<genID>".
	// But the frontend only sends us what we returned.
	// In TestFlowHandler we returned BOTH.
	// Frontend should pass both. Let's assume frontend passes `workflow_id` as query param if needed,
	// or we change the URL to /api/test/flow/{workflowID}/{runID}

	// Fix: Let's look at query params for workflow_id
	workflowID = r.URL.Query().Get("workflow_id")
	if workflowID == "" {
		fmt.Println("ERROR: Missing workflow_id query param")
		http.Error(w, "Missing workflow_id query param", http.StatusBadRequest)
		return
	}

	// Check Status
	desc, err := c.DescribeWorkflowExecution(r.Context(), workflowID, runID)
	if err != nil {
		http.Error(w, "Failed to describe workflow: "+err.Error(), http.StatusNotFound)
		return
	}

	// Normalize Status
	// Temporal returns strings like "WORKFLOW_EXECUTION_STATUS_COMPLETED" OR "Completed" depending on SDK/Enums
	// We normalize to UPPERCASE for UI consistency.
	rawStatus := desc.WorkflowExecutionInfo.Status.String()
	upperStatus := strings.ToUpper(rawStatus)
	var simpleStatus string

	switch upperStatus {
	case "COMPLETED", "WORKFLOW_EXECUTION_STATUS_COMPLETED":
		simpleStatus = "COMPLETED"
	case "FAILED", "WORKFLOW_EXECUTION_STATUS_FAILED", "TERMINATED", "WORKFLOW_EXECUTION_STATUS_TERMINATED", "TIMED_OUT":
		simpleStatus = "FAILED"
	case "CANCELED", "WORKFLOW_EXECUTION_STATUS_CANCELED":
		simpleStatus = "CANCELED"
	case "RUNNING", "WORKFLOW_EXECUTION_STATUS_RUNNING":
		simpleStatus = "RUNNING"
	default:
		// Fallback
		simpleStatus = upperStatus
	}

	// Debug log
	fmt.Printf("Workflow Status Check - ID: %s, Raw: %s, Simple: %s\n", workflowID, rawStatus, simpleStatus)

	var output interface{}

	// If Completed or Failed, get the result/error
	if simpleStatus == "COMPLETED" || simpleStatus == "FAILED" {
		// We can get the result
		// Note: Get expects a pointer
		err = c.GetWorkflow(r.Context(), workflowID, runID).Get(r.Context(), &output)
		if err != nil {
			// If failed, the error comes here
			output = map[string]string{"error": err.Error()}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": simpleStatus,
		"output": output,
	})
}

// SimpleLogger implements client.Logger to suppress "No logger configured" messages
type SimpleLogger struct{}

func (s *SimpleLogger) Debug(msg string, keyvals ...interface{}) {}
func (s *SimpleLogger) Info(msg string, keyvals ...interface{})  {}
func (s *SimpleLogger) Warn(msg string, keyvals ...interface{})  { fmt.Println("WARN:", msg, keyvals) }
func (s *SimpleLogger) Error(msg string, keyvals ...interface{}) { fmt.Println("ERROR:", msg, keyvals) }

// CancelFlowRequest is the payload for cancelling a flow
type CancelFlowRequest struct {
	WorkflowID string `json:"workflow_id"`
	RunID      string `json:"run_id"`
}

// CancelFlowHandler terminates a running workflow
func CancelFlowHandler(w http.ResponseWriter, r *http.Request) {
	var req CancelFlowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	hostPort := os.Getenv("TEMPORAL_HOST_PORT")
	if hostPort == "" {
		hostPort = "127.0.0.1:7233"
	}

	logger := &SimpleLogger{}

	c, err := client.Dial(client.Options{
		HostPort: hostPort,
		Logger:   logger,
	})
	if err != nil {
		fmt.Printf("Failed to connect to Temporal: %v\n", err)
		http.Error(w, "Failed to connect to Temporal", http.StatusInternalServerError)
		return
	}
	defer c.Close()

	if err := c.CancelWorkflow(r.Context(), req.WorkflowID, req.RunID); err != nil {
		fmt.Printf("Failed to cancel workflow: %v\n", err)
		http.Error(w, "Failed to cancel workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "cancelled"})
}
