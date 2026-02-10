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
	// Team scope requires joining team_members, which is complex via PostgREST simple client in one go
	// unless we have a view or do two queries.
	// For MVP: Org scope (all) and Personal scope.
	// We can add Team later.

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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
