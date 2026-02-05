package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"

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
	limit := 100 // Increased limit to ensure we get latest even without DB sort

	type DashboardFlow struct {
		ID                 string           `json:"id"`
		FlowID             string           `json:"flow_id"`
		Status             string           `json:"status"`
		TemporalWorkflowID string           `json:"temporal_workflow_id"`
		RunID              string           `json:"run_id"`
		StartedAt          string           `json:"started_at"`
		Priority           string           `json:"priority"`
		InputData          map[string]any   `json:"input_data"`
		FlowName           string           `json:"flow_name"`
		FlowDescription    string           `json:"flow_description"`
		FlowAssignments    []map[string]any `json:"flow_assignments"`
		ActionCount        int              `json:"action_count"`
		TaskAssignments    []map[string]any `json:"task_assignments"`
		LatestActivityAt   string           `json:"latest_activity_at"`
		CurrentAction      *string          `json:"current_action"`
	}

	var results []DashboardFlow

	// Query the optimized SQL view
	// Note: We sort in Go because the PostgREST client wrapper .Order() syntax varies.
	err := client.DB.From("dashboard_action_flows").
		Select("*").
		Limit(limit).
		Execute(&results)

	if err != nil {
		http.Error(w, "Failed to fetch action flows: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Sort results by LatestActivityAt desc
	sort.Slice(results, func(i, j int) bool {
		return results[i].LatestActivityAt > results[j].LatestActivityAt
	})

	// Flatten Result
	type FlatResult struct {
		ID                 string           `json:"id"`
		FlowID             string           `json:"flow_id"`
		FlowName           string           `json:"flow_name"`
		FlowDescription    string           `json:"flow_description"`
		Title              string           `json:"title"`
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
		// Title Logic: InputData > FlowName
		displayTitle := r.FlowName
		if t, ok := r.InputData["title"].(string); ok && t != "" {
			displayTitle = t
		} else {
			displayTitle = "Untitled Instance"
			if t, ok := r.InputData["title"].(string); ok && t != "" {
				displayTitle = t
			}
		}

		// Assignments Logic: Prefer Flow (manual) > Task (aggregated)
		finalAssignments := r.FlowAssignments
		if len(finalAssignments) == 0 && len(r.TaskAssignments) > 0 {
			finalAssignments = r.TaskAssignments
		}

		currentAction := "System processing"
		if r.CurrentAction != nil {
			currentAction = *r.CurrentAction
		}

		latest := r.LatestActivityAt
		if latest == "" {
			latest = r.StartedAt
		}

		flatResults[i] = FlatResult{
			ID:                 r.ID,
			FlowID:             r.FlowID,
			FlowName:           r.FlowName,
			FlowDescription:    r.FlowDescription,
			Title:              displayTitle,
			Status:             r.Status,
			TemporalWorkflowID: r.TemporalWorkflowID,
			StartedAt:          r.StartedAt,
			Priority:           r.Priority,
			Assignments:        finalAssignments,
			HasAssignments:     len(finalAssignments) > 0,
			ActionCount:        r.ActionCount,
			CurrentAction:      currentAction,
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
		StepNumber   int                      `json:"step_number"`      // Added StepNumber
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
			NodeID       *string                  `json:"node_id"`
		}
		var tasks []HumanTask
		// Query using RunID
		client.DB.From("human_tasks").
			Select("id, title, description, information, instructions, status, created_at, assignments, schema, node_id"). // Added schema and node_id
			Eq("run_id", af.RunID).
			Execute(&tasks)

		// Create a Map of NodeID -> Task for merging
		taskMap := make(map[string]HumanTask)
		for _, t := range tasks {
			if t.NodeID != nil && *t.NodeID != "" {
				taskMap[*t.NodeID] = t
			} else {
				// Legacy tasks without NodeID
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
					Schema:       t.Schema,
				})
			}
		}

		// fetch flow definition
		if af.FlowID != "" {
			var flowDefs []struct {
				Definition map[string]interface{} `json:"definition"`
			}
			client.DB.From("flows").Select("definition").Eq("id", af.FlowID).Execute(&flowDefs)

			// Calculate Node Depths (Step Numbers)
			nodeDepths := make(map[string]int)
			if edgesList, ok := flowDefs[0].Definition["edges"].([]interface{}); ok {
				adj := make(map[string][]string)
				inDegree := make(map[string]int)

				// Build Adjacency List & In-Degree
				for _, e := range edgesList {
					if eMap, ok := e.(map[string]interface{}); ok {
						src, _ := eMap["source"].(string)
						tgt, _ := eMap["target"].(string)
						if src != "" && tgt != "" {
							adj[src] = append(adj[src], tgt)
							inDegree[tgt]++
						}
					}
				}

				// Find Start Nodes (Any node with In-Degree 0)
				var queue []string
				visited := make(map[string]bool)

				if nodesList, ok := flowDefs[0].Definition["nodes"].([]interface{}); ok {
					for _, n := range nodesList {
						if nMap, ok := n.(map[string]interface{}); ok {
							nID, _ := nMap["id"].(string)
							if inDegree[nID] == 0 {
								queue = append(queue, nID)
								visited[nID] = true
								nodeDepths[nID] = 1
							}
						}
					}
				}

				// BFS
				for len(queue) > 0 {
					curr := queue[0]
					queue = queue[1:]
					currDepth := nodeDepths[curr]

					for _, neighbor := range adj[curr] {
						if !visited[neighbor] {
							visited[neighbor] = true
							nodeDepths[neighbor] = currDepth + 1
							queue = append(queue, neighbor)
						}
					}
				}
			}

			processedNodeIDs := make(map[string]bool)

			if len(flowDefs) > 0 && flowDefs[0].Definition != nil {
				// Walk through nodes in definition
				if nodesList, ok := flowDefs[0].Definition["nodes"].([]interface{}); ok {
					for _, n := range nodesList {
						if nodeMap, ok := n.(map[string]interface{}); ok {
							nodeType, _ := nodeMap["type"].(string)
							nodeID, _ := nodeMap["id"].(string)
							data, _ := nodeMap["data"].(map[string]interface{})

							// Get calculated Step Number
							stepNum := nodeDepths[nodeID]
							if stepNum == 0 {
								stepNum = 99 // Fallback for disconnected nodes
							}

							// Only care about Human Tasks
							if nodeType == "human_task" || nodeType == "human_action" || nodeType == "human-task" || nodeType == "human-action" {
								// Check if we have a runtime task for this node
								if task, exists := taskMap[nodeID]; exists {
									// Add the *real* task
									activities = append(activities, Activity{
										Type:         "human_action",
										Name:         task.Title,
										Description:  task.Description,
										Information:  task.Information,
										Instructions: task.Instructions,
										Status:       task.Status,
										StartedAt:    task.CreatedAt,
										ID:           task.ID,
										Assignments:  task.Assignments,
										Schema:       task.Schema,
										StepNumber:   stepNum,
									})
									processedNodeIDs[nodeID] = true
								} else {
									// Create a "Future" stub
									label, _ := data["label"].(string)
									title, _ := data["title"].(string)
									if title == "" {
										title = label
									}
									if title == "" {
										title = "Future Task"
									}

									// Basic variable substitution for title/description
									// This is a lightweight substitute for full Liquid rendering
									if af.InputData != nil {
										for k, v := range af.InputData {
											placeholder := fmt.Sprintf("{{ steps.trigger.body.%s }}", k)
											if strVal, ok := v.(string); ok {
												title = strings.ReplaceAll(title, placeholder, strVal)
											}
										}
									}

									// Extract Schema
									var schema []map[string]interface{}
									if schemaRaw, ok := data["schema"].([]interface{}); ok {
										for _, s := range schemaRaw {
											if sMap, ok := s.(map[string]interface{}); ok {
												schema = append(schema, sMap)
											}
										}
									}

									activities = append(activities, Activity{
										Type:       "human_action",
										Name:       title,
										Status:     "PENDING_START", // Custom status for UI
										StartedAt:  "",              // Not started
										ID:         "future-" + nodeID,
										Schema:     schema,
										StepNumber: stepNum,
									})
								}
							}
						}
					}
				}
			}

			// Add Orphaned Tasks (Tasks in DB but not in Definition or failed to match)
			for nodeID, task := range taskMap {
				if !processedNodeIDs[nodeID] {
					activities = append(activities, Activity{
						Type:         "human_action",
						Name:         task.Title,
						Description:  task.Description,
						Information:  task.Information,
						Instructions: task.Instructions,
						Status:       task.Status,
						StartedAt:    task.CreatedAt,
						ID:           task.ID,
						Assignments:  task.Assignments,
						Schema:       task.Schema,
					})
				}
			}
		} else {
			// Fallback if no FlowID (Orphaned run?), just dump tasks
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
					Schema:       t.Schema,
				})
			}
		}
	}

	// Sort Activities by StartedAt
	// Simple bubble sort or slice sort since list is small
	// Adding dependency on "sort" package might be annoying if not imported.
	// Let's use simple bubble sort for <10 items usually.
	// Sort Activities: Primary = StepNumber ASC, Secondary = StartedAt ASC
	sort.Slice(activities, func(i, j int) bool {
		if activities[i].StepNumber != activities[j].StepNumber {
			return activities[i].StepNumber < activities[j].StepNumber
		}
		return activities[i].StartedAt < activities[j].StartedAt
	})

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
