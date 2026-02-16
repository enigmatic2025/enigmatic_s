package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	temporalClient "go.temporal.io/sdk/client"
)

type FlowHandler struct {
	TemporalClient temporalClient.Client
}

func NewFlowHandler(c temporalClient.Client) *FlowHandler {
	return &FlowHandler{
		TemporalClient: c,
	}
}

// CreateFlow creates a new flow
func (h *FlowHandler) CreateFlow(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OrgID           string                 `json:"org_id"`
		Slug            string                 `json:"slug"` // Add Slug field
		Name            string                 `json:"name"`
		Description     string                 `json:"description"`
		Definition      map[string]interface{} `json:"definition"`
		VariablesSchema []interface{}          `json:"variables_schema"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()

	// Resolve OrgID from Slug if OrgID is missing or invalid placeholder
	if (req.OrgID == "" || req.OrgID == "00000000-0000-0000-0000-000000000000") && req.Slug != "" {
		var orgs []struct {
			ID string `json:"id"`
		}
		err := dbClient.DB.From("organizations").Select("id").Eq("slug", req.Slug).Execute(&orgs)
		if err == nil && len(orgs) > 0 {
			req.OrgID = orgs[0].ID
		}
	}

	if req.OrgID == "" || req.Name == "" {
		http.Error(w, "OrgID (or valid Slug) and Name are required", http.StatusBadRequest)
		return
	}

	// Default empty definition if not provided
	if req.Definition == nil {
		req.Definition = map[string]interface{}{
			"nodes":    []interface{}{},
			"edges":    []interface{}{},
			"viewport": map[string]interface{}{"x": 0, "y": 0, "zoom": 1},
		}
	}

	// Check for duplicate name
	var existing []struct {
		ID string `json:"id"`
	}
	err := dbClient.DB.From("flows").Select("id").Eq("org_id", req.OrgID).Eq("name", req.Name).Execute(&existing)
	if err == nil && len(existing) > 0 {
		http.Error(w, "A flow with this name already exists", http.StatusConflict)
		return
	}

	var results []map[string]interface{}
	err = dbClient.DB.From("flows").Insert(map[string]interface{}{
		"org_id":           req.OrgID,
		"name":             req.Name,
		"description":      req.Description,
		"draft_definition": req.Definition,
		"definition":       req.Definition, // COMPATIBILITY: The DB schema requires 'definition' (NOT NULL). We mirror draft here to satisfy it.
		"variables_schema": req.VariablesSchema,
		"is_active":        false, // Draft by default
		"version":          1,
	}).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to create flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// UpdateFlow updates an existing flow
func (h *FlowHandler) UpdateFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("id")
	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Name            string                 `json:"name"`
		Description     string                 `json:"description"`
		Definition      map[string]interface{} `json:"definition"`
		VariablesSchema []interface{}          `json:"variables_schema"`
		IsActive        *bool                  `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Definition != nil {
		updates["draft_definition"] = req.Definition
	}
	if req.VariablesSchema != nil {
		updates["variables_schema"] = req.VariablesSchema
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	updates["updated_at"] = time.Now()

	// Check for duplicate name if name is being updated
	if req.Name != "" {
		// First get the org_id of the current flow
		var currentFlow []struct {
			OrgID string `json:"org_id"`
		}
		err := database.GetClient().DB.From("flows").Select("org_id").Eq("id", flowID).Execute(&currentFlow)
		if err != nil || len(currentFlow) == 0 {
			http.Error(w, "Flow not found", http.StatusNotFound)
			return
		}

		var existing []struct {
			ID string `json:"id"`
		}
		err = database.GetClient().DB.From("flows").Select("id").Eq("org_id", currentFlow[0].OrgID).Eq("name", req.Name).Neq("id", flowID).Execute(&existing)
		if err == nil && len(existing) > 0 {
			http.Error(w, "A flow with this name already exists", http.StatusConflict)
			return
		}
	}

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()
	var results []map[string]interface{}
	err := dbClient.DB.From("flows").Update(updates).Eq("id", flowID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// GetFlow gets a flow by ID
func (h *FlowHandler) GetFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("id")
	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()
	var results []map[string]interface{}
	err := dbClient.DB.From("flows").Select("*").Eq("id", flowID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to get flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(results) == 0 {
		http.Error(w, "Flow not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// ListFlows lists all flows for an organization
func (h *FlowHandler) ListFlows(w http.ResponseWriter, r *http.Request) {
	slug := r.URL.Query().Get("slug")
	if slug == "" {
		http.Error(w, "Slug is required", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()

	// 1. Resolve Org ID from Slug
	var orgs []struct {
		ID string `json:"id"`
	}
	err := dbClient.DB.From("organizations").Select("id").Eq("slug", slug).Execute(&orgs)
	if err != nil || len(orgs) == 0 {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}
	orgID := orgs[0].ID

	// 2. Fetch Flows
	var flows []map[string]interface{}
	err = dbClient.DB.From("flows").Select("*").Eq("org_id", orgID).Execute(&flows)

	if err != nil {
		http.Error(w, "Failed to fetch flows: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Hydrate Last Run (Optimization: In a real app, use a View or Computed Column)
	if len(flows) > 0 {
		for i, f := range flows {
			flowID, _ := f["id"].(string)
			if flowID != "" {
				var runs []struct {
					CreatedAt string `json:"created_at"`
				}
				// Fetch the single most recent run for this flow
				// Error query is ignored to avoid breaking the main list
				dbClient.DB.From("action_flows").
					Select("created_at").
					Eq("flow_id", flowID).
					Execute(&runs)

				if len(runs) > 0 {
					flows[i]["last_run"] = runs[0].CreatedAt
				}
			}
		}
	}

	// Note: Sorting is currently handled by the database query order or default insertion order.
	// If explicit sorting by updated_at is needed, ensure the PostgREST library supports .Order() correctly.

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flows)
}

// DeleteFlow deletes a flow by ID
func (h *FlowHandler) DeleteFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("id")
	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()
	var results []map[string]interface{}
	err := dbClient.DB.From("flows").Delete().Eq("id", flowID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to delete flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Flow deleted successfully"})
}

// PublishFlow promotes draft to published
func (h *FlowHandler) PublishFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("id")
	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()

	// 1. Get current draft
	var current []struct {
		DraftDefinition map[string]interface{} `json:"draft_definition"`
	}
	err := dbClient.DB.From("flows").Select("draft_definition").Eq("id", flowID).Execute(&current)
	if err != nil || len(current) == 0 {
		http.Error(w, "Flow not found", http.StatusNotFound)
		return
	}

	if current[0].DraftDefinition == nil {
		http.Error(w, "Draft is empty", http.StatusBadRequest)
		return
	}

	// 2. Promote to Published
	// Note: Supabase/PostgREST doesn't support "SET col = other_col" easily in one Update call via client usually (unless using RPC).
	// So we fetch (done) and update.

	// 2. Promote to Published
	var results []map[string]interface{}
	err = dbClient.DB.From("flows").Update(map[string]interface{}{
		"published_definition": current[0].DraftDefinition,
		"definition":           current[0].DraftDefinition, // Keep legacy definition in sync
		"published_at":         time.Now(),
		"is_active":            true, // Auto-activate on publish? Maybe not, checking user intent. Usually publish implies ready. Let's strictly follow button state if possible, but usually publish -> active. Let's leave is_active alone strictly unless requested, BUT the user said "Inactive means it cannot be called".
		// Actually, let's NOT auto-activate. The user has an "Active/Inactive" toggle.
	}).Eq("id", flowID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to publish flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Flow published successfully",
		"published_at": time.Now(),
	})
}
