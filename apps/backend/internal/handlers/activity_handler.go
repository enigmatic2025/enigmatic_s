package handlers

import (
	"encoding/json"
	"net/http"
	"sort"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type ActivityHandler struct{}

func NewActivityHandler() *ActivityHandler {
	return &ActivityHandler{}
}

// GetActivityFeed handles GET /api/activity-feed
func (h *ActivityHandler) GetActivityFeed(w http.ResponseWriter, r *http.Request) {
	client := database.GetClient()

	scope := r.URL.Query().Get("scope") // org, team, personal
	orgID := r.URL.Query().Get("org_id")
	slug := r.URL.Query().Get("slug")
	userID := r.URL.Query().Get("user_id") // Optional, for personal scope

	// If slug is provided, resolve org_id
	if slug != "" && orgID == "" {
		var org []struct {
			ID string `json:"id"`
		}
		err := client.DB.From("organizations").Select("id").Eq("slug", slug).Execute(&org)
		if err == nil && len(org) > 0 {
			orgID = org[0].ID
		}
	}

	// Basic Validation
	if orgID == "" {
		http.Error(w, "org_id or slug is required", http.StatusBadRequest)
		return
	}

	query := client.DB.From("audit_logs").
		Select("*").
		Eq("org_id", orgID)

	// Scope Filtering
	if scope == "personal" && userID != "" {
		query = query.Eq("user_id", userID)
	}

	var results []map[string]interface{}
	err := query.Execute(&results) // Limit on client side or simply not too many
	if err != nil {
		http.Error(w, "Failed to fetch activities: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Sort by created_at DESC (Newest first)
	sort.Slice(results, func(i, j int) bool {
		t1Str, _ := results[i]["created_at"].(string)
		t2Str, _ := results[j]["created_at"].(string)
		return t1Str > t2Str // DESC
	})

	// Slice to limit
	if len(results) > 20 {
		results = results[:20]
	}

	// Enrich with action_flow_id for navigation
	// 1. Collect IDs
	runIDs := make(map[string]bool)
	taskIDs := make(map[string]bool)

	for _, log := range results {
		eventType, _ := log["event_type"].(string)
		resourceID, _ := log["resource_id"].(string)

		if resourceID == "" {
			continue
		}

		if eventType == "flow.started" || eventType == "flow.completed" || eventType == "flow.failed" {
			runIDs[resourceID] = true
		} else if eventType == "task.created" || eventType == "task.completed" {
			taskIDs[resourceID] = true
		}
	}

	// 2. Resolve Task IDs to Run IDs
	if len(taskIDs) > 0 {
		var tasks []struct {
			ID    string `json:"id"`
			RunID string `json:"run_id"`
		}
		// Build list of IDs for IN query
		var idList []string
		for id := range taskIDs {
			idList = append(idList, id)
		}

		if len(idList) > 0 {
			// Convert to comma separated string (format: (id1,id2))
			// Supabase client doesn't support IN easily with this library sometimes, but let's try .In
			// Actually, let's just use "id,in.(...)" filter format if possible, or simple loop if small
			// We will try .In() here as it is standard in many query builders, if not supported we might need another way
			// But looking at previous code, .In() was used.
			client.DB.From("human_tasks").Select("id, run_id").In("id", idList).Execute(&tasks)

			for _, t := range tasks {
				if t.RunID != "" {
					runIDs[t.RunID] = true
					// Map task ID to run ID later if needed, but we do it nicely in step 4
				}
			}
		}
	}

	// 3. Resolve Run IDs to Action Flow IDs (UUIDs) + Metadata
	type FlowInfo struct {
		ID          string
		Title       string
		ReferenceID string
		Priority    string
		Description string
		Assignments []map[string]any
		InputData   map[string]any
	}
	runToFlowInfo := make(map[string]FlowInfo)

	if len(runIDs) > 0 {
		var flows []struct {
			ID                 string           `json:"id"`
			RunID              string           `json:"run_id"`
			TemporalWorkflowID string           `json:"temporal_workflow_id"` // Matches DB
			FlowID             string           `json:"flow_id"`              // Matches DB
			Priority           string           `json:"priority"`
			Assignments        []map[string]any `json:"assignments"`
			InputData          map[string]any   `json:"input_data"`
			// Title and Description missing in DB, extracting from InputData
		}
		var runIdList []string
		for id := range runIDs {
			runIdList = append(runIdList, id)
		}

		// Select available fields
		err := client.DB.From("action_flows").
			Select("id, run_id, temporal_workflow_id, flow_id, priority, assignments, input_data").
			In("run_id", runIdList).
			Execute(&flows)

		if err != nil {
			// Log error but continue? Or just fail?
			// For now, let's just log if possible, but we don't have logger here easily.
			// The details will just be missing.
		}

		for _, f := range flows {
			desc := ""
			title := f.FlowID // Default title to flow ID or name

			if f.InputData != nil {
				if d, ok := f.InputData["description"].(string); ok {
					desc = d
				}
				if t, ok := f.InputData["title"].(string); ok {
					title = t
				} else if t, ok := f.InputData["flow_name"].(string); ok {
					title = t
				}
			}

			// Reference ID defaults to Temporal Workflow ID (e.g. AF-2024-xxx)
			refID := f.TemporalWorkflowID

			runToFlowInfo[f.RunID] = FlowInfo{
				ID:          f.ID,
				Title:       title,
				ReferenceID: refID,
				Priority:    f.Priority,
				Assignments: f.Assignments,
				Description: desc,
				InputData:   f.InputData,
			}
		}
	}

	// 4. Also fetch Task info to map task_id back to run_id if we did it in batch above
	taskToRunID := make(map[string]string)
	if len(taskIDs) > 0 {
		var tasks []struct {
			ID    string `json:"id"`
			RunID string `json:"run_id"`
		}
		var idList []string
		for id := range taskIDs {
			idList = append(idList, id)
		}
		client.DB.From("human_tasks").Select("id, run_id").In("id", idList).Execute(&tasks)
		for _, t := range tasks {
			taskToRunID[t.ID] = t.RunID
		}
	}

	// 5. Inject info into details
	for i, log := range results {
		eventType, _ := log["event_type"].(string)
		resourceID, _ := log["resource_id"].(string)
		details, ok := log["details"].(map[string]interface{})
		if !ok {
			details = make(map[string]interface{})
		}

		var info FlowInfo
		found := false

		// Logic to associate Activity with Flow Info
		if eventType == "flow.started" || eventType == "flow.completed" || eventType == "flow.failed" || eventType == "system.alert" {
			// system.alert might link to run_id via resource_id if we standardize it
			info, found = runToFlowInfo[resourceID]
		} else if eventType == "task.created" || eventType == "task.completed" {
			runID := taskToRunID[resourceID]
			if runID != "" {
				info, found = runToFlowInfo[runID]
			}
		}

		if found {
			details["action_flow_id"] = info.ID

			// Inject metadata if missing, for better UI display
			if _, ok := details["flow_name"]; !ok && info.Title != "" {
				details["flow_name"] = info.Title
			}
			if _, ok := details["reference_id"]; !ok && info.ReferenceID != "" {
				details["reference_id"] = info.ReferenceID
			}
			// Inject Priority
			if _, ok := details["priority"]; !ok && info.Priority != "" {
				details["priority"] = info.Priority
			}
			// Inject Description
			if _, ok := details["description"]; !ok && info.Description != "" {
				details["description"] = info.Description
			}
			// Inject Assignments (optional, if UI wants to show avatars)
			if _, ok := details["assignments"]; !ok && len(info.Assignments) > 0 {
				details["assignments"] = info.Assignments
			}

			// Auto-detect "Anomaly" style for critical high priority system events
			if info.Priority == "critical" && (eventType == "flow.started" || eventType == "system.alert") {
				if _, ok := details["type"]; !ok {
					details["type"] = "anomaly"
				}
				if _, ok := details["target"]; !ok {
					// Extract target from Title or Input?
					// Heuristic: "Reefer Alert" or just use flow name
					details["target"] = info.Title
				}
			}
		}

		results[i]["details"] = details
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
