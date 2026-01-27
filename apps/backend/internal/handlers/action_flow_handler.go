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
		Title              string         `json:"title"`
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
			// PostgREST "in" filter format: (id1,id2,...)
			// optimizing: select id,name from flows where id in (...)
			// Since we don't have a robust 'In' builder here easily without string join,
			// let's just fetch all names or loop. Fetching all is safer for small counts.
			// Actually, let's just loop-query or assume client cache? No, backend hydration is better.
			// Re-using existing logic but fixed strict typing.
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
		Title              string `json:"title"` // Dynamic Instance Title
		Status             string `json:"status"`
		TemporalWorkflowID string `json:"temporal_workflow_id"`
		StartedAt          string `json:"started_at"`
	}

	flatResults := make([]FlatResult, len(results))
	for i, r := range results {
		flowName := flowNameMap[r.FlowID]
		if flowName == "" {
			flowName = "Unknown Flow"
		}

		// Use the Dynamic Title if available, otherwise fallback to Flow Name in UI logic
		// But here we send both.

		flatResults[i] = FlatResult{
			ID:                 r.ID,
			FlowID:             r.FlowID,
			FlowName:           flowName,
			Title:              r.Title,
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

// GetActionFlow handles GET /api/action-flows/{id}
func (h *ActionFlowHandler) GetActionFlow(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	type ActionFlowResult struct {
		ID                 string         `json:"id"`
		FlowID             string         `json:"flow_id"`
		Status             string         `json:"status"`
		TemporalWorkflowID string         `json:"temporal_workflow_id"`
		RunID              string         `json:"run_id"`
		InputData          map[string]any `json:"input_data"`
		Output             map[string]any `json:"output"`
		StartedAt          string         `json:"started_at"`
	}

	var results []ActionFlowResult

	// Fetch Action Flow
	err := client.DB.From("action_flows").
		Select("*").
		Eq("id", id).
		Execute(&results)

	if err != nil {
		http.Error(w, "Failed to fetch action flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(results) == 0 {
		http.Error(w, "Action Flow not found", http.StatusNotFound)
		return
	}

	af := results[0]

	// Fetch Flow Name
	var flowName string = "Unknown Flow"
	if af.FlowID != "" {
		var flows []struct {
			Name string `json:"name"`
		}
		client.DB.From("flows").Select("name").Eq("id", af.FlowID).Execute(&flows)
		if len(flows) > 0 {
			flowName = flows[0].Name
		}
	}

	// Fetch Activities (Human Tasks + System Events)
	type Activity struct {
		Type      string `json:"type"` // "trigger", "human_action", "end"
		Name      string `json:"name"`
		Status    string `json:"status"`
		StartedAt string `json:"started_at"`
		ID        string `json:"id,omitempty"`
	}
	var activities []Activity

	// 1. Start Event
	activities = append(activities, Activity{
		Type:      "trigger",
		Name:      "Workflow Started",
		Status:    "COMPLETED",
		StartedAt: af.StartedAt,
	})

	// 2. Human Tasks
	if af.RunID != "" {
		type HumanTask struct {
			ID        string `json:"id"`
			Title     string `json:"title"` // Dynamic title
			Status    string `json:"status"`
			CreatedAt string `json:"created_at"`
		}
		var tasks []HumanTask
		// Query using RunID
		client.DB.From("human_tasks").
			Select("id, title, status, created_at").
			Eq("run_id", af.RunID).
			Execute(&tasks)

		for _, t := range tasks {
			activities = append(activities, Activity{
				Type:      "human_action",
				Name:      t.Title,
				Status:    t.Status,
				StartedAt: t.CreatedAt,
				ID:        t.ID,
			})
		}
	}

	// Sort Activities by StartedAt
	// Simple bubble sort or slice sort since list is small
	// Adding dependency on "sort" package might be annoying if not imported.
	// Let's use simple bubble sort for <10 items usually.
	for i := 0; i < len(activities); i++ {
		for j := 0; j < len(activities)-i-1; j++ {
			if activities[j].StartedAt > activities[j+1].StartedAt {
				activities[j], activities[j+1] = activities[j+1], activities[j]
			}
		}
	}

	// 3. End Event (if finished)
	if af.Status == "COMPLETED" || af.Status == "FAILED" || af.Status == "TERMINATED" {
		// We don't have exact ended_at column yet, using a rough placement or none?
		// User wants a list. If we don't have end time, maybe we don't show "Activity" for end,
		// but the Status label shows it.
		// However, purely for the list visualization, let's allow "Completed" state.
		// We can reuse StartedAt (bad) or leave it out.
		// Let's add it if we have a way to know time. For now, skipping explicit "End Activity" in the list
		// unless we want to show it. Koyeb usually shows "Deployment healthy" as a final state.
		// Let's stick to "Actions" meaning "Things that happened".
	}

	// Flatten Result
	type FlatResult struct {
		ID                 string         `json:"id"`
		FlowID             string         `json:"flow_id"`
		FlowName           string         `json:"flow_name"`
		Title              string         `json:"title"`
		Status             string         `json:"status"`
		TemporalWorkflowID string         `json:"temporal_workflow_id"`
		RunID              string         `json:"run_id"`
		StartedAt          string         `json:"started_at"`
		InputData          map[string]any `json:"input_data"`
		Output             map[string]any `json:"output"`
		Activities         []Activity     `json:"activities"`
	}

	// Use Dynamic Title or Fallback
	displayTitle := ""
	if t, ok := af.InputData["title"].(string); ok && t != "" {
		displayTitle = t
	}
	if displayTitle == "" {
		displayTitle = flowName
	}

	response := FlatResult{
		ID:                 af.ID,
		FlowID:             af.FlowID,
		FlowName:           flowName,
		Title:              displayTitle,
		Status:             af.Status,
		TemporalWorkflowID: af.TemporalWorkflowID,
		RunID:              af.RunID,
		StartedAt:          af.StartedAt,
		InputData:          af.InputData,
		Output:             af.Output,
		Activities:         activities,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
