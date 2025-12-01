package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type FlowHandler struct{}

func NewFlowHandler() *FlowHandler {
	return &FlowHandler{}
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

	client := database.GetClient()

	// Resolve OrgID from Slug if OrgID is missing or invalid placeholder
	if (req.OrgID == "" || req.OrgID == "00000000-0000-0000-0000-000000000000") && req.Slug != "" {
		var orgs []struct {
			ID string `json:"id"`
		}
		err := client.DB.From("organizations").Select("id").Eq("slug", req.Slug).Execute(&orgs)
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

	var results []map[string]interface{}
	err := client.DB.From("flows").Insert(map[string]interface{}{
		"org_id":           req.OrgID,
		"name":             req.Name,
		"description":      req.Description,
		"definition":       req.Definition,
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
	flowID := strings.TrimPrefix(r.URL.Path, "/flows/")
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
		updates["definition"] = req.Definition
	}
	if req.VariablesSchema != nil {
		updates["variables_schema"] = req.VariablesSchema
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	updates["updated_at"] = time.Now()

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("flows").Update(updates).Eq("id", flowID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update flow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// GetFlow gets a flow by ID
func (h *FlowHandler) GetFlow(w http.ResponseWriter, r *http.Request) {
	flowID := strings.TrimPrefix(r.URL.Path, "/flows/")
	if flowID == "" {
		http.Error(w, "Flow ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("flows").Select("*").Eq("id", flowID).Execute(&results)

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

	client := database.GetClient()

	// 1. Resolve Org ID from Slug
	var orgs []struct {
		ID string `json:"id"`
	}
	err := client.DB.From("organizations").Select("id").Eq("slug", slug).Execute(&orgs)
	if err != nil || len(orgs) == 0 {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}
	orgID := orgs[0].ID

	// 2. Fetch Flows
	var flows []map[string]interface{}
	err = client.DB.From("flows").Select("*").Eq("org_id", orgID).Execute(&flows)

	if err != nil {
		http.Error(w, "Failed to fetch flows: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Sort in memory since Order method is causing build issues
	// Assuming updated_at is a string (ISO8601)
	/*
	sort.Slice(flows, func(i, j int) bool {
		t1, _ := flows[i]["updated_at"].(string)
		t2, _ := flows[j]["updated_at"].(string)
		return t1 > t2
	})
	*/

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flows)
}
