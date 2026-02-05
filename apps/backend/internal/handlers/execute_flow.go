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
	// We use a temporary struct to capture the DB result
	var dbResult []struct {
		ID                  string          `json:"id"`
		OrgID               string          `json:"org_id"` // Added OrgID
		Name                string          `json:"name"`
		PublishedDefinition json.RawMessage `json:"published_definition"`
		Definition          json.RawMessage `json:"definition"`
		VariablesSchema     json.RawMessage `json:"variables_schema"`
		IsActive            bool            `json:"is_active"`
	}

	err := dbClient.DB.From("flows").Select("id, org_id, name, published_definition, definition, variables_schema, is_active").Eq("id", flowID).Execute(&dbResult)
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

	// Inject Flow ID and Org ID
	flowDef.ID = flowID
	flowDef.OrgID = dbResult[0].OrgID

	// 3.5 Validate Trigger Schema
	// Check if the input body matches the required fields defined in the API Trigger
	for _, node := range flowDef.Nodes {
		if node.Type == "api-trigger" {
			if schemaRaw, ok := node.Data["schema"]; ok {
				// Determine if schemaRaw is a list of objects
				// We need to marshal/unmarshal or type assert carefully
				// Start by assuming it came effectively from JSON unmarshal as []interface{}
				if schemaList, ok := schemaRaw.([]interface{}); ok {
					var missingFields []string

					for _, fieldItem := range schemaList {
						if fieldMap, ok := fieldItem.(map[string]interface{}); ok {
							key, _ := fieldMap["key"].(string)
							required, _ := fieldMap["required"].(bool)

							if key != "" && required {
								val, exists := inputData[key]
								// Check existence and nilness
								if !exists || val == nil {
									missingFields = append(missingFields, key)
								}
							}
						}
					}

					if len(missingFields) > 0 {
						http.Error(w, fmt.Sprintf("Missing required fields: %v", missingFields), http.StatusBadRequest)
						return
					}
				}
			}
			// Only one start trigger per flow usually, so we can break
			break
		}
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

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "Flow execution started",
		"workflow_id": we.GetID(),
		"run_id":      we.GetRunID(),
	})
}
