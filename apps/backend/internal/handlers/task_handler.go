package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/audit"
	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"go.temporal.io/sdk/client"
)

// HumanTaskHandler handles task-related endpoints
type HumanTaskHandler struct {
	TemporalClient client.Client
}

func NewHumanTaskHandler(temporalClient client.Client) *HumanTaskHandler {
	return &HumanTaskHandler{
		TemporalClient: temporalClient,
	}
}

// GetTasksHandler lists tasks for a user (or all if admin)
// GET /api/tasks?email=...&status=PENDING&user_id=...
func (h *HumanTaskHandler) GetTasksHandler(w http.ResponseWriter, r *http.Request) {
	db := database.GetClient().DB

	email := r.URL.Query().Get("email")
	status := r.URL.Query().Get("status")
	userID := r.URL.Query().Get("user_id")

	var tasks []map[string]interface{}
	var err error

	// Build query with real filters only (no dummy column hacks)
	selectQuery := db.From("human_tasks").Select("*")

	// Determine which filters to apply
	hasEmail := email != ""
	hasStatus := status != ""

	if hasEmail && hasStatus {
		err = selectQuery.Eq("assignee", email).Eq("status", status).Execute(&tasks)
	} else if hasEmail {
		err = selectQuery.Eq("assignee", email).Execute(&tasks)
	} else if hasStatus {
		err = selectQuery.Eq("status", status).Execute(&tasks)
	} else {
		err = selectQuery.Execute(&tasks)
	}

	if err != nil {
		http.Error(w, "Failed to fetch tasks: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Post-query filter: if user_id is specified, filter by assignments JSONB in Go
	if userID != "" {
		var filtered []map[string]interface{}
		for _, task := range tasks {
			assignments, ok := task["assignments"]
			if !ok || assignments == nil {
				continue
			}
			assignmentList, ok := assignments.([]interface{})
			if !ok {
				continue
			}
			for _, a := range assignmentList {
				aMap, ok := a.(map[string]interface{})
				if !ok {
					continue
				}
				if aMap["id"] == userID {
					filtered = append(filtered, task)
					break
				}
			}
		}
		tasks = filtered
	}

	// Ensure we return [] not null
	if tasks == nil {
		tasks = []map[string]interface{}{}
	}

	// Sort by created_at DESC in Go
	sort.Slice(tasks, func(i, j int) bool {
		t1Str, _ := tasks[i]["created_at"].(string)
		t2Str, _ := tasks[j]["created_at"].(string)
		return t1Str > t2Str
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// CompleteTaskHandler submits the form and resumes the workflow
// POST /api/tasks/{id}/complete
func (h *HumanTaskHandler) CompleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("id")
	if taskID == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}

	var payload struct {
		Output map[string]interface{} `json:"output"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	var task []struct {
		ID     string                   `json:"id"`
		RunID  string                   `json:"run_id"`
		FlowID string                   `json:"flow_id"` // Added FlowID
		Status string                   `json:"status"`
		Title  string                   `json:"title"` // Added Title for logging
		Schema []map[string]interface{} `json:"schema"`
	}

	err := client.DB.From("human_tasks").Select("*").Eq("id", taskID).Execute(&task)
	if err != nil || len(task) == 0 {
		fmt.Printf("DEBUG: Task Lookup Failed. ID=%s, Err=%v, Count=%d\n", taskID, err, len(task))
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	// 1.5 Fetch Workflow ID from Action Flow
	var actionFlow []struct {
		TemporalWorkflowID string `json:"temporal_workflow_id"`
		OrgID              string `json:"org_id"`
	}
	// Use RunID to link Task to Execution, as FlowID points to Definition
	err = client.DB.From("action_flows").Select("temporal_workflow_id, org_id").Eq("run_id", task[0].RunID).Execute(&actionFlow)
	if err != nil || len(actionFlow) == 0 {
		fmt.Printf("DEBUG: Action Flow Lookup Failed. RunID=%s, Err=%v\n", task[0].RunID, err)
		http.Error(w, "Action flow not found", http.StatusInternalServerError)
		return
	}
	workflowID := actionFlow[0].TemporalWorkflowID

	if task[0].Status != "PENDING" {
		http.Error(w, "Task already completed", http.StatusConflict)
		return
	}

	// 2. Update Task Status
	updateData := map[string]interface{}{
		"status":     "COMPLETED",
		"output":     payload.Output,
		"updated_at": time.Now(),
	}

	var updateRes []interface{}
	err = client.DB.From("human_tasks").Update(updateData).Eq("id", taskID).Execute(&updateRes)
	if err != nil {
		fmt.Printf("DEBUG: Task Update Failed. ID=%s, Err=%v\n", taskID, err)
		http.Error(w, "Failed to update task", http.StatusInternalServerError)
		return
	}

	// 3. Signal Workflow
	signalName := "HumanTask-" + taskID
	signalArg := map[string]interface{}{
		"task_id": taskID,
		"output":  payload.Output,
	}

	// Correctly pass WorkflowID and RunID
	err = h.TemporalClient.SignalWorkflow(r.Context(), workflowID, task[0].RunID, signalName, signalArg)
	if err != nil {
		fmt.Printf("DEBUG: SignalWorkflow FAILED: %v\n", err)
		http.Error(w, "Task completed but workflow signal failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Printf("DEBUG: SignalWorkflow SUCCESS for WorkflowID=%s RunID=%s Signal=%s\n", workflowID, task[0].RunID, signalName)

	// Log Activity: Task Completed
	// We extract user info from context if available (TODO: Add Auth Middleware extraction)
	// For now, assume userID is nil or extracted from elsewhere.
	// Actually, we can check assignments?
	audit.LogActivity(r.Context(), actionFlow[0].OrgID, nil, "task.completed", &taskID, map[string]interface{}{
		"task_title": task[0].Title, // Assuming title was fetched in step 1? Wait, step 1 fetched Select("*")? No.
		// Let's verify task fetch query.
		// line 82: err := client.DB.From("human_tasks").Select("*").Eq("id", taskID).Execute(&task)
		// human_tasks struct used in step 1 DOES NOT have Title field explicitly in my view above?
		// Wait, line 74 defines the struct. I need to add Title there if I want to log it.
	}, "")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// UpdateTaskHandler updates task details (assignments)
// PATCH /api/tasks/{id}
func (h *HumanTaskHandler) UpdateTaskHandler(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("id")
	if taskID == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}

	var payload struct {
		Assignments []map[string]interface{} `json:"assignments"`
		Output      map[string]interface{}   `json:"output"` // Added output for drafts
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	// Update Task
	updateData := map[string]interface{}{
		"updated_at": time.Now(),
	}
	if payload.Assignments != nil {
		updateData["assignments"] = payload.Assignments
	}
	if payload.Output != nil {
		updateData["output"] = payload.Output
	}

	var updateRes []interface{}
	err := client.DB.From("human_tasks").Update(updateData).Eq("id", taskID).Execute(&updateRes)
	if err != nil {
		http.Error(w, "Failed to update task: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
