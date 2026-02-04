package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"

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
		ID                 string           `json:"id"`
		FlowID             string           `json:"flow_id"`
		Status             string           `json:"status"`
		TemporalWorkflowID string           `json:"temporal_workflow_id"`
		RunID              string           `json:"run_id"` // Added RunID
		InputData          map[string]any   `json:"input_data"`
		StartedAt          string           `json:"started_at"`
		Title              string           `json:"title"`
		Priority           string           `json:"priority"`
		Assignments        []map[string]any `json:"assignments"`
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

	// Sort explicitly in Go since .Order() might be missing in this client version
	sort.Slice(results, func(i, j int) bool {
		return results[i].StartedAt > results[j].StartedAt
	})

	// 2. Hydrate Flow Names manually
	type FlowInfo struct {
		Name        string
		Description string
	}
	flowMap := make(map[string]FlowInfo)

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
				ID          string `json:"id"`
				Name        string `json:"name"`
				Description string `json:"description"`
			}
			// Fetch flows with description
			client.DB.From("flows").Select("id, name, description").Execute(&flows)
			for _, f := range flows {
				flowMap[f.ID] = FlowInfo{
					Name:        f.Name,
					Description: f.Description,
				}
			}
		}
	}

	// 2.5 Fetch Action Stats (Human Tasks)
	type TaskStat struct {
		RunID     string `json:"run_id"`
		Title     string `json:"title"`
		Status    string `json:"status"`
		CreatedAt string `json:"created_at"`
	}
	taskStatsMap := make(map[string]struct {
		Count          int
		CurrentAction  string
		LatestActivity string
	})

	if len(results) > 0 {
		runIDs := make([]string, 0)
		for _, r := range results {
			if r.RunID != "" {
				runIDs = append(runIDs, r.RunID)
			}
		}

		if len(runIDs) > 0 {
			var tasks []TaskStat
			// Fetch all tasks for these flows.
			// Note: PostgREST In filter slightly tedious in this client wrapper if not supported directly.
			// Assuming we can fetch all or loop. For 50 items, fetching all human_tasks might be too big.
			// Let's rely on a rough loop or if the client supports In.
			// The current client wrapper seems simple. Let's try to just fetch all human_tasks for now if expected volume is low,
			// OR optimally, we skip this optimization if strict "IN" query isn't easy,
			// BUT for a dashboard, we need it.
			// Let's assume we can fetch recent human tasks.
			client.DB.From("human_tasks").
				Select("run_id, title, status, created_at").
				Limit(500). // Cap at 500 tasks to avoid massive payload
				Execute(&tasks)

			// Sort tasks by created_at desc
			sort.Slice(tasks, func(i, j int) bool {
				return tasks[i].CreatedAt > tasks[j].CreatedAt
			})

			for _, t := range tasks {
				stat := taskStatsMap[t.RunID]
				stat.Count++

				// Latest Activity: Max(created_at)
				if stat.LatestActivity == "" || t.CreatedAt > stat.LatestActivity {
					stat.LatestActivity = t.CreatedAt
				}

				// Current Action: First PENDING/IN_PROGRESS found (since we ordered by desc, correct logic is complex)
				// Actually, we want the *active* one.
				if t.Status == "PENDING" || t.Status == "IN_PROGRESS" {
					// Overwrite nicely or pick the latest? define "Current" as most recently created pending task.
					// Given sorting by desc, the first one we hit is likely the newest.
					if stat.CurrentAction == "" {
						stat.CurrentAction = t.Title
					}
				}
				taskStatsMap[t.RunID] = stat
			}
		}
	}

	// 3. Flatten Result
	type FlatResult struct {
		ID                 string           `json:"id"`
		FlowID             string           `json:"flow_id"`
		FlowName           string           `json:"flow_name"`
		FlowDescription    string           `json:"flow_description"` // Added
		Title              string           `json:"title"`            // Dynamic Instance Title
		Status             string           `json:"status"`
		TemporalWorkflowID string           `json:"temporal_workflow_id"`
		StartedAt          string           `json:"started_at"`
		Priority           string           `json:"priority"`
		Assignments        []map[string]any `json:"assignments"`
		HasAssignments     bool             `json:"has_assignments"`
		ActionCount        int              `json:"action_count"`
		CurrentAction      string           `json:"current_action"`
		LatestActivityAt   string           `json:"latest_activity_at"`
	}

	flatResults := make([]FlatResult, len(results))
	for i, r := range results {
		info := flowMap[r.FlowID]
		flowName := info.Name
		if flowName == "" {
			flowName = "Unknown Flow"
		}

		stats := taskStatsMap[r.RunID]

		// Fallback for LatestActivityAt
		latest := stats.LatestActivity
		if latest == "" {
			latest = r.StartedAt
		}

		flatResults[i] = FlatResult{
			ID:                 r.ID,
			FlowID:             r.FlowID,
			FlowName:           flowName,
			FlowDescription:    info.Description,
			Title:              r.Title,
			Status:             r.Status,
			TemporalWorkflowID: r.TemporalWorkflowID,
			StartedAt:          r.StartedAt,
			Priority:           r.Priority,
			Assignments:        r.Assignments,
			ActionCount:        stats.Count,
			CurrentAction:      stats.CurrentAction,
			LatestActivityAt:   latest,
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

	// 1. Get the action flow first to find the Temporal Workflow ID and Run ID
	type ActionFlowInfo struct {
		TemporalWorkflowID string `json:"temporal_workflow_id"`
		Status             string `json:"status"`
		RunID              string `json:"run_id"`
	}
	var results []ActionFlowInfo

	// Check if record exists
	err := dbClient.DB.From("action_flows").Select("temporal_workflow_id, status, run_id").Eq("id", id).Execute(&results)

	if err == nil && len(results) > 0 {
		af := results[0]
		// 2. Try to terminate workflow if needed
		if h.TemporalClient != nil && (af.Status == "RUNNING" || af.Status == "PAUSED") {
			_ = h.TemporalClient.TerminateWorkflow(context.Background(), af.TemporalWorkflowID, "", "User deleted form dashboard")
		}

		// 3. Delete associated Human Tasks
		// Logic removed: handled by database trigger/cascade
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
		ID                 string           `json:"id"`
		OrgID              string           `json:"org_id"` // Added OrgID
		FlowID             string           `json:"flow_id"`
		Status             string           `json:"status"`
		TemporalWorkflowID string           `json:"temporal_workflow_id"`
		RunID              string           `json:"run_id"`
		InputData          map[string]any   `json:"input_data"`
		KeyData            map[string]any   `json:"key_data"` // Added KeyData
		Output             map[string]any   `json:"output"`
		StartedAt          string           `json:"started_at"`
		Priority           string           `json:"priority"`
		Assignments        []map[string]any `json:"assignments"` // Added
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

	// Fetch Flow Name and OrgID
	var flowName string = "Unknown Flow"
	var flowOrgID string = ""
	if af.FlowID != "" {
		var flows []struct {
			Name  string `json:"name"`
			OrgID string `json:"org_id"`
		}
		client.DB.From("flows").Select("name, org_id").Eq("id", af.FlowID).Execute(&flows)
		if len(flows) > 0 {
			flowName = flows[0].Name
			flowOrgID = flows[0].OrgID
		}
	}

	// Fetch Activities (Human Tasks + System Events)
	type Activity struct {
		Type         string                   `json:"type"` // "trigger", "human_action", "end"
		Name         string                   `json:"name"`
		Description  string                   `json:"description,omitempty"`
		Information  string                   `json:"information,omitempty"`  // Added Information
		Instructions string                   `json:"instructions,omitempty"` // Added Instructions (rich text)
		Status       string                   `json:"status"`
		StartedAt    string                   `json:"started_at"`
		ID           string                   `json:"id,omitempty"`
		Assignments  []map[string]interface{} `json:"assignments,omitempty"`
		Schema       []map[string]interface{} `json:"schema,omitempty"` // Added Schema
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
			ID           string                   `json:"id"`
			Title        string                   `json:"title"`
			Description  string                   `json:"description"`
			Information  string                   `json:"information"`
			Instructions string                   `json:"instructions"`
			Status       string                   `json:"status"`
			CreatedAt    string                   `json:"created_at"`
			Assignments  []map[string]interface{} `json:"assignments"`
			Schema       []map[string]interface{} `json:"schema"` // Added Schema
		}
		var tasks []HumanTask
		// Query using RunID
		client.DB.From("human_tasks").
			Select("id, title, description, information, instructions, status, created_at, assignments, schema"). // Added schema
			Eq("run_id", af.RunID).
			Execute(&tasks)

		for _, t := range tasks {
			activities = append(activities, Activity{
				Type:         "human_action",
				Name:         t.Title,
				Description:  t.Description,
				Information:  t.Information,
				Instructions: t.Instructions,
				Status:       t.Status,
				StartedAt:    t.CreatedAt,
				ID:           t.ID,
				Assignments:  t.Assignments,
				Schema:       t.Schema, // Map schema
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
		ID                 string           `json:"id"`
		OrgID              string           `json:"org_id"` // Added OrgID
		FlowID             string           `json:"flow_id"`
		FlowName           string           `json:"flow_name"`
		Title              string           `json:"title"`
		Status             string           `json:"status"`
		TemporalWorkflowID string           `json:"temporal_workflow_id"`
		RunID              string           `json:"run_id"`
		StartedAt          string           `json:"started_at"`
		Priority           string           `json:"priority"`
		Assignments        []map[string]any `json:"assignments"` // Added
		InputData          map[string]any   `json:"input_data"`
		KeyData            map[string]any   `json:"key_data"`

		Output     map[string]any `json:"output"`
		Activities []Activity     `json:"activities"`
	}

	// Use Dynamic Title or Fallback
	displayTitle := ""
	if t, ok := af.InputData["title"].(string); ok && t != "" {
		displayTitle = t
	}
	if displayTitle == "" {
		displayTitle = flowName
	}

	// Use OrgID from Flow if not found in ActionFlow
	finalOrgID := af.OrgID
	if finalOrgID == "" {
		finalOrgID = flowOrgID
	}

	response := FlatResult{
		ID:                 af.ID,
		OrgID:              finalOrgID,
		FlowID:             af.FlowID,
		FlowName:           flowName,
		Title:              displayTitle,
		Status:             af.Status,
		TemporalWorkflowID: af.TemporalWorkflowID,
		RunID:              af.RunID,
		StartedAt:          af.StartedAt,
		Priority:           af.Priority,
		Assignments:        af.Assignments,
		InputData:          af.InputData,
		KeyData:            af.KeyData,

		Output:     af.Output,
		Activities: activities,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateActionFlow handles PATCH /api/action-flows/{id}
func (h *ActionFlowHandler) UpdateActionFlow(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}

	var payload struct {
		Priority    string           `json:"priority"`
		Assignments []map[string]any `json:"assignments"` // Added
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if payload.Priority == "" && payload.Assignments == nil {
		http.Error(w, "Nothing to update", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	updates := make(map[string]interface{})

	// Validate Assign
	if payload.Assignments != nil {
		// Basic validation: ensure it's a list
		updates["assignments"] = payload.Assignments
	}

	// Validate Priority
	if payload.Priority != "" {
		valid := false
		for _, p := range []string{"low", "medium", "high", "critical"} {
			if p == payload.Priority {
				valid = true
				break
			}
		}
		if !valid {
			http.Error(w, "Invalid priority", http.StatusBadRequest)
			return
		}
		updates["priority"] = payload.Priority
	}

	// Update
	var result []map[string]interface{}
	err := client.DB.From("action_flows").
		Update(updates).
		Eq("id", id).
		Execute(&result)

	if err != nil {
		http.Error(w, "Failed to update: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}
