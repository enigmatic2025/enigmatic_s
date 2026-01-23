package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"go.temporal.io/sdk/client"
)

type ActionFlowHandler struct {
	TemporalClient client.Client
}

func NewActionFlowHandler(c client.Client) *ActionFlowHandler {
	return &ActionFlowHandler{
		TemporalClient: c,
	}
}

// ListActionFlows handles GET /api/action-flows
func (h *ActionFlowHandler) ListActionFlows(w http.ResponseWriter, r *http.Request) {
	client := database.GetClient()

	limit := 50

	type ActionFlowResult struct {
		ID                 string         `json:"id"`
		FlowID             string         `json:"flow_id"`
		Status             string         `json:"status"`
		TemporalWorkflowID string         `json:"temporal_workflow_id"`
		InputData          map[string]any `json:"input_data"`
		StartedAt          string         `json:"started_at"`
	}

	var results []ActionFlowResult

	// 1. Fetch Action Flows (Raw)
	err := client.DB.From("action_flows").
		Select("*").
		Limit(limit).
		Execute(&results)

	if err != nil {
		http.Error(w, "Failed to fetch action flows: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Hydrate Flow Names manually
	flowNameMap := make(map[string]string)
	if len(results) > 0 {
		flowIDs := make([]string, 0)
		seen := make(map[string]bool)

		for _, af := range results {
			if af.FlowID != "" && !seen[af.FlowID] {
				flowIDs = append(flowIDs, af.FlowID)
				seen[af.FlowID] = true
			}
		}

		if len(flowIDs) > 0 {
			var flows []struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}
			client.DB.From("flows").Select("id, name").Execute(&flows)
			for _, f := range flows {
				flowNameMap[f.ID] = f.Name
			}
		}
	}

	// 3. Flatten Result
	type FlatResult struct {
		ID                 string `json:"id"`
		FlowID             string `json:"flow_id"`
		FlowName           string `json:"flow_name"`
		Status             string `json:"status"`
		TemporalWorkflowID string `json:"temporal_workflow_id"`
		StartedAt          string `json:"started_at"`
	}

	flatResults := make([]FlatResult, len(results))
	for i, r := range results {
		name := flowNameMap[r.FlowID]
		if name == "" {
			name = "Unknown Flow"
			if r.FlowID != "" {
				name = "Flow " + r.FlowID[0:6] + "..."
			}
		}

		flatResults[i] = FlatResult{
			ID:                 r.ID,
			FlowID:             r.FlowID,
			FlowName:           name,
			Status:             r.Status,
			TemporalWorkflowID: r.TemporalWorkflowID,
			StartedAt:          r.StartedAt,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flatResults)
}

// DeleteActionFlow handles DELETE /api/action-flows/{id}
func (h *ActionFlowHandler) DeleteActionFlow(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()

	// 1. Get the action flow first to find the Temporal Workflow ID
	type ActionFlowInfo struct {
		TemporalWorkflowID string `json:"temporal_workflow_id"`
		Status             string `json:"status"`
	}
	var results []ActionFlowInfo

	// Check if record exists
	err := dbClient.DB.From("action_flows").Select("temporal_workflow_id, status").Eq("id", id).Execute(&results)

	if err == nil && len(results) > 0 {
		af := results[0]
		// 2. Try to terminate workflow if needed
		if h.TemporalClient != nil && (af.Status == "RUNNING" || af.Status == "PAUSED") {
			// Terminate it. We ignore error if it's already done.
			_ = h.TemporalClient.TerminateWorkflow(context.Background(), af.TemporalWorkflowID, "", "User deleted form dashboard")
		}
	}

	// 3. Delete from DB
	// PostgREST Execute requires a target to unmarshal into, even for Delete
	var deleted []map[string]interface{}
	err = dbClient.DB.From("action_flows").Delete().Eq("id", id).Execute(&deleted)
	if err != nil {
		http.Error(w, "Failed to delete: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Deleted %s", id)
}
