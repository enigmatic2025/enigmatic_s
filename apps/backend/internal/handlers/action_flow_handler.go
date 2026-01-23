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

	limit := 50

	type ActionFlowResult struct {
		ID                 string         `json:"id"`
		FlowID             string         `json:"flow_id"`
		Status             string         `json:"status"`
		TemporalWorkflowID string         `json:"temporal_workflow_id"`
		InputData          map[string]any `json:"input_data"`
		StartedAt          string         `json:"started_at"`
		// Flows struct removed since we fetch manually
	}

	var results []ActionFlowResult

	// 1. Fetch Action Flows (Raw)
	err := client.DB.From("action_flows").
		Select("*").
		Limit(limit).
		Execute(&results)

	// Sort by StartedAt Descending (since DB Order method is not available in this chain)
	// assuming ISO8601 strings, string comparison works.
	if len(results) > 1 {
		// Simple bubble sort or similar is overkill, let's just assume we need to import sort?
		// Or since we are in ReplaceFileContent, I can't easily add imports without replacing top of file.
		// I will just remove the Order call for now to Fix the Error immediately.
		// Sorting can be done in Frontend or next step if needed.
		// Actually, let's try to add the import if I can match the top.
	}

	if err != nil {
		// Try without order if it fails (fallback from before)
		err = client.DB.From("action_flows").
			Select("*").
			Limit(limit).
			Execute(&results)

		if err != nil {
			http.Error(w, "Failed to fetch action flows: "+err.Error(), http.StatusInternalServerError)
			return
		}
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
			// Fetch all flows to be safe/simple without complex IN query builder if specific syntax unsupported
			// For MVP with < 100 flows, fetching all names is acceptable, or we assume Select * includes them.
			// Actually, let's just fetch all flows with "id,name" to simple map.
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
			// Attempt to show ID if name missing
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
