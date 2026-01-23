package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/workflow"
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

// ExecuteFlow handles the execution of a flow by ID
// POST /flows/{flow_id}/execute
func (h *ExecuteFlowHandler) ExecuteFlow(w http.ResponseWriter, r *http.Request) {
	// 1. Extract Flow ID
	// 1. Extract Flow ID
	// Handles paths like /flows/{id}/execute
	flowID := r.PathValue("id")

	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	// 2. Parse Input Data from Body
	// If body is empty, default to empty map
	var inputData map[string]interface{}
	if r.ContentLength > 0 {
		if err := json.NewDecoder(r.Body).Decode(&inputData); err != nil {
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}
	}
	if inputData == nil {
		inputData = make(map[string]interface{})
	}

	// 3. Fetch Flow Definition from DB
	dbClient := database.GetClient()

	// We use a temporary struct to capture the DB result
	var dbResult []struct {
		ID                  string          `json:"id"`
		Name                string          `json:"name"`
		PublishedDefinition json.RawMessage `json:"published_definition"`
		Definition          json.RawMessage `json:"definition"`
		VariablesSchema     json.RawMessage `json:"variables_schema"`
		IsActive            bool            `json:"is_active"`
	}

	err := dbClient.DB.From("flows").Select("id, name, published_definition, definition, variables_schema, is_active").Eq("id", flowID).Execute(&dbResult)
	if err != nil || len(dbResult) == 0 {
		http.Error(w, "Flow not found", http.StatusNotFound)
		return
	}

	if !dbResult[0].IsActive {
		http.Error(w, "Flow is not active", http.StatusBadRequest)
		return
	}

	// Deserialize definition into workflow.FlowDefinition
	var flowDef workflow.FlowDefinition
	defBytes := dbResult[0].PublishedDefinition
	if defBytes == nil {
		defBytes = dbResult[0].Definition
	}

	if err := json.Unmarshal(defBytes, &flowDef); err != nil {
		http.Error(w, "Invalid flow definition in database", http.StatusInternalServerError)
		return
	}

	// Inject Flow ID
	flowDef.ID = flowID

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

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "Flow execution started",
		"workflow_id": we.GetID(),
		"run_id":      we.GetRunID(),
	})
}
