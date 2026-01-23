package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type ActionFlowHandler struct{}

func NewActionFlowHandler() *ActionFlowHandler {
	return &ActionFlowHandler{}
}

// ListActionFlows handles GET /api/action-flows
func (h *ActionFlowHandler) ListActionFlows(w http.ResponseWriter, r *http.Request) {
	client := database.GetClient()

	// Parse query params
	limit := 50
	// For production, parse "limit" query param to int

	// Struct to hold the result including joined flow name
	type ActionFlowResult struct {
		ID                 string         `json:"id"`
		FlowID             string         `json:"flow_id"`
		Status             string         `json:"status"`
		TemporalWorkflowID string         `json:"temporal_workflow_id"`
		InputData          map[string]any `json:"input_data"`
		StartedAt          string         `json:"started_at"`

		// Joined fields from 'flows' table
		// Note: Supabase logic might require flattened structure or nested
		Flows struct {
			Name string `json:"name"`
		} `json:"flows"`
	}

	var results []ActionFlowResult

	// Using Supabase select syntax.
	// We removed the join "flows(name)" because it causes errors if the FK relation isn't explicitly exposed to PostgREST.
	err := client.DB.From("action_flows").
		Select("*").
		Limit(limit).
		Execute(&results)

	if err != nil {
		// Fallback: Fetch without join
		// If the join fails, it usually returns error about "flows" relation
		http.Error(w, "Failed to fetch action flows: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Flatten for frontend
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
		flatResults[i] = FlatResult{
			ID:                 r.ID,
			FlowID:             r.FlowID,
			FlowName:           r.Flows.Name,
			Status:             r.Status,
			TemporalWorkflowID: r.TemporalWorkflowID,
			StartedAt:          r.StartedAt,
		}
		if flatResults[i].FlowName == "" {
			flatResults[i].FlowName = "Unknown Flow"
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flatResults)
}
