package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// PromoteToAdmin promotes a user to system admin
// Protected by Auth Middleware and Role Check
func (h *AdminHandler) PromoteToAdmin(w http.ResponseWriter, r *http.Request) {
	// 1. Get Caller ID from Context
	callerID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	client := database.GetClient()

	// 2. Check if Caller is System Admin
	var caller []struct {
		SystemRole string `json:"system_role"`
	}
	err := client.DB.From("profiles").Select("system_role").Eq("id", callerID).Execute(&caller)
	if err != nil || len(caller) == 0 || caller[0].SystemRole != "admin" {
		log.Printf("Unauthorized promotion attempt by user: %s", callerID)
		http.Error(w, "Forbidden: Only admins can promote users", http.StatusForbidden)
		return
	}

	// 3. Get Target User ID from Body
	var req struct {
		UserID string `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 4. Update Profile
	var results []map[string]interface{}
	err = client.DB.From("profiles").Update(map[string]interface{}{
		"system_role": "admin",
	}).Eq("id", req.UserID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update profile: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "User promoted to admin"})
}

// ListUsers lists all users
func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	// TODO: Add pagination
	client := database.GetClient()

	var users []map[string]interface{}
	err := client.DB.From("profiles").Select("*").Execute(&users)

	if err != nil {
		log.Printf("Failed to fetch users: %v", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// ListOrgs lists all organizations
func (h *AdminHandler) ListOrgs(w http.ResponseWriter, r *http.Request) {
	client := database.GetClient()

	var orgs []map[string]interface{}
	err := client.DB.From("organizations").Select("*").Execute(&orgs)

	if err != nil {
		log.Printf("Failed to fetch orgs: %v", err)
		http.Error(w, "Failed to fetch orgs", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orgs)
}
