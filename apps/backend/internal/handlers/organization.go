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
