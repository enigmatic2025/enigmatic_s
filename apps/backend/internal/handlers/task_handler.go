package handlers

import (
	"encoding/json"
	"net/http"
	"time"

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
// GET /api/tasks?email=...&status=PENDING
func (h *HumanTaskHandler) GetTasksHandler(w http.ResponseWriter, r *http.Request) {
	db := database.GetClient().DB

	email := r.URL.Query().Get("email")
	status := r.URL.Query().Get("status")

	// Start query and normalize to FilterRequestBuilder using a dummy condition
	// This helps avoid type mismatch between SelectRequestBuilder and FilterRequestBuilder
	query := db.From("human_tasks").Select("*").Eq("1", "1")

	if email != "" {
		query = query.Eq("assignee", email)
	}
	if status != "" {
		query = query.Eq("status", status)
	}

	var tasks []map[string]interface{}
	// Execute query
	err := query.Execute(&tasks)
	if err != nil {
		http.Error(w, "Failed to fetch tasks: "+err.Error(), http.StatusInternalServerError)
		return
	}

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
		ID     string                 `json:"id"`
		RunID  string                 `json:"run_id"`
		Status string                 `json:"status"`
		Schema map[string]interface{} `json:"schema"`
	}

	err := client.DB.From("human_tasks").Select("*").Eq("id", taskID).Execute(&task)
	if err != nil || len(task) == 0 {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

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
		http.Error(w, "Failed to update task", http.StatusInternalServerError)
		return
	}

	// 3. Signal Workflow
	signalName := "HumanTask-" + taskID
	signalArg := map[string]interface{}{
		"task_id": taskID,
		"output":  payload.Output,
	}

	err = h.TemporalClient.SignalWorkflow(r.Context(), task[0].RunID, "", signalName, signalArg)
	if err != nil {
		http.Error(w, "Task completed but workflow signal failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

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
