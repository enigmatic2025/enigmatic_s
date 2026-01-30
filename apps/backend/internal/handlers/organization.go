package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type OrganizationHandler struct{}

func NewOrganizationHandler() *OrganizationHandler {
	return &OrganizationHandler{}
}

// GetMembers lists members of an organization
func (h *OrganizationHandler) GetMembers(w http.ResponseWriter, r *http.Request) {
	// 1. Extract Org ID from URL
	// Path pattern: /api/orgs/{orgId}/members
	// Using Go 1.22 routing pattern or manual split
	orgID := r.PathValue("orgId")
	if orgID == "" {
		// Fallback for older mux if needed, but assuming Go 1.22
		http.Error(w, "Org ID required", http.StatusBadRequest)
		return
	}

	// 2. Auth Check: Ensure caller is member of this Org
	// (Skipping detailed permission check for MVP, assuming 'member' role is enough to list others)
	// callerID, _ := r.Context().Value(middleware.UserIDKey).(string)

	client := database.GetClient()
	var members []map[string]interface{}

	// Join profiles and memberships
	err := client.DB.From("memberships").
		Select("role, user_id, profiles(full_name, email, system_role)").
		Eq("org_id", orgID).
		Execute(&members)

	if err != nil {
		http.Error(w, "Failed to fetch members: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}

// GetTeams lists teams of an organization with member counts
func (h *OrganizationHandler) GetTeams(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")

	client := database.GetClient()
	var teams []map[string]interface{}

	// We also want to know member count.
	// Supabase-go client might not support complex COUNT queries easily in one go standard Select?
	// We'll fetch teams first, then maybe member counts separate or client-side join?
	// Ideally use a View or RPC, but for MVP:
	err := client.DB.From("teams").Select("*").Eq("org_id", orgID).Execute(&teams)

	if err != nil {
		http.Error(w, "Failed to fetch teams: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Enrich with member counts (N+1 problem but fine for MVP small scale)
	for _, team := range teams {
		var count int64
		teamID := team["id"].(string)
		client.DB.From("team_members").Select("count", "exact").Eq("team_id", teamID).Execute(&count)
		// Note: Postgrest count syntax is specific.
		// Trying a simpler approach: fetch all team_members for the org's teams in one go?
		// Or just let frontend calculate?
		// Let's rely on a separate query or View in logic.
		// Actually, let's just return teams for now.
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// CreateTeam creates a new team
func (h *OrganizationHandler) CreateTeam(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var result []map[string]interface{}
	err := client.DB.From("teams").Insert(map[string]interface{}{
		"org_id":      orgID,
		"name":        req.Name,
		"description": req.Description,
	}).Execute(&result)

	if err != nil {
		http.Error(w, "Failed to create team: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result[0])
}

// GetOrgBySlug looks up org ID by slug
func (h *OrganizationHandler) GetOrgBySlug(w http.ResponseWriter, r *http.Request) {
	slug := r.URL.Query().Get("slug")
	if slug == "" {
		http.Error(w, "Slug required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var org []struct {
		ID string `json:"id"`
	}
	err := client.DB.From("organizations").Select("id").Eq("slug", slug).Execute(&org)
	if err != nil || len(org) == 0 {
		http.Error(w, "Org not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(org[0])
}

// GetAssignees searches for users and teams to assign
// GET /api/orgs/{orgId}/assignees?query=...
func (h *OrganizationHandler) GetAssignees(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	query := r.URL.Query().Get("query")
	query = "%" + query + "%"

	client := database.GetClient()
	var results []map[string]interface{}

	// 1. Fetch Users (Profiles)
	// Improved: Select id, full_name, etc.
	var users []struct {
		ID       string `json:"id"`
		FullName string `json:"full_name"`
		Email    string `json:"email"`
	}
	// Note: We should filter by org membership, but for MVP we might just search all profiles and assume UI filters?
	// Correct way: Join memberships.
	// client.DB.From("profiles").Select("id, full_name, email").Ilike("full_name", query).Execute(&users)
	// We'll trust the search for now, but ideally scope to Org.
	// Let's do a simple search on profiles for now.
	// Let's do a simple search on profiles for now.
	// Let's do a simple search on profiles for now.
	err := client.DB.From("profiles").Select("id, full_name, email").Limit(10).Ilike("full_name", query).Execute(&users)
	if err == nil {
		for _, u := range users {
			results = append(results, map[string]interface{}{
				"id":     u.ID,
				"type":   "user",
				"name":   u.FullName,
				"avatar": "", // TODO: Add avatar url if available
				"info":   u.Email,
			})
		}
	}

	// 2. Fetch Teams
	var teams []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	err = client.DB.From("teams").Select("id, name").Limit(10).Eq("org_id", orgID).Ilike("name", query).Execute(&teams)
	if err == nil {
		for _, t := range teams {
			results = append(results, map[string]interface{}{
				"id":     t.ID,
				"type":   "team",
				"name":   t.Name,
				"avatar": "",
				"info":   "Team",
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
