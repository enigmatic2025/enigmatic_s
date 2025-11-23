package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

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
		// Unauthorized promotion attempt
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
	// Fetch users with their memberships and organization details
	// Assuming foreign keys are set up: profiles -> memberships -> organizations
	// Note: Column is org_id, not organization_id
	err := client.DB.From("profiles").Select("*, memberships(org_id, organizations(name))").Execute(&users)

	if err != nil {
		log.Printf("DEBUG: Failed to fetch users: %v", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	log.Printf("DEBUG: Successfully fetched %d users", len(users))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// ListOrgs lists all organizations
func (h *AdminHandler) ListOrgs(w http.ResponseWriter, r *http.Request) {
	client := database.GetClient()

	// Fetch all organizations
	// Note: This relies on the Service Role Key (SUPABASE_KEY) being used in the client
	// to bypass RLS policies that might restrict visibility.
	// Fetch all organizations
	// Note: This relies on the Service Role Key (SUPABASE_KEY) being used in the client
	// to bypass RLS policies that might restrict visibility.
	var orgs []map[string]interface{}
	// 'plan' column is missing in the DB. Selecting only known columns.
	err := client.DB.From("organizations").Select("id, name, slug, created_at").Execute(&orgs)

	if err != nil {
		log.Printf("DEBUG: Failed to fetch orgs: %v", err)
		http.Error(w, "Failed to fetch orgs", http.StatusInternalServerError)
		return
	}
	log.Printf("DEBUG: Successfully fetched %d orgs", len(orgs))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orgs)
}

// CreateOrganization creates a new organization
func (h *AdminHandler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
		Plan string `json:"plan"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Slug == "" {
		http.Error(w, "Name and slug are required", http.StatusBadRequest)
		return
	}

	if req.Plan == "" {
		req.Plan = "free"
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("organizations").Insert(map[string]interface{}{
		"name": req.Name,
		"slug": req.Slug,
		"plan": req.Plan,
	}).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to create organization: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// UpdateOrganization updates an organization
func (h *AdminHandler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	orgID := strings.TrimPrefix(r.URL.Path, "/admin/orgs/")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
		Plan string `json:"plan"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Slug != "" {
		updates["slug"] = req.Slug
	}
	if req.Plan != "" {
		updates["plan"] = req.Plan
	}

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("organizations").Update(updates).Eq("id", orgID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update organization: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// DeleteOrganization deletes an organization (with protection for "Enigmatic")
func (h *AdminHandler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	orgID := strings.TrimPrefix(r.URL.Path, "/admin/orgs/")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	// Get the organization first to check if it's protected
	var org []struct {
		Name string `json:"name"`
	}
	err := client.DB.From("organizations").Select("name").Eq("id", orgID).Execute(&org)
	if err != nil || len(org) == 0 {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	// Protect "Enigmatic" organization from deletion
	if org[0].Name == "Enigmatic" {
		http.Error(w, "Cannot delete the Enigmatic organization", http.StatusForbidden)
		return
	}

	var results []map[string]interface{}
	err = client.DB.From("organizations").Delete().Eq("id", orgID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to delete organization: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Organization deleted"})
}

// CreateUser creates a new user account
func (h *AdminHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email          string `json:"email"`
		Password       string `json:"password"`
		FullName       string `json:"full_name"`
		UserType       string `json:"user_type"` // 'system' or 'standard'
		OrganizationID string `json:"organization_id"`
		Role           string `json:"role"` // Org role if standard

	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	if req.UserType == "" {
		req.UserType = "standard"
	}
	if req.UserType == "standard" && req.Role == "" {
		req.Role = "member"
	}

	// Note: This requires Supabase Admin API access
	// You'll need to use the Service Role key and make HTTP requests to Supabase's admin endpoints
	// For now, returning a placeholder response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "User creation requires Supabase Admin API integration",
	})
}

// UpdateUser updates a user's profile
func (h *AdminHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Email    string `json:"email"`
		FullName string `json:"full_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})
	if req.FullName != "" {
		updates["full_name"] = req.FullName
	}

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("profiles").Update(updates).Eq("id", userID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

// DeleteUser deletes a user account
func (h *AdminHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	// Note: This requires Supabase Admin API access
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "User deletion requires Supabase Admin API integration",
	})
}

// BlockUser blocks or unblocks a user
func (h *AdminHandler) BlockUser(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	userID = strings.TrimSuffix(userID, "/block")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Blocked bool `json:"blocked"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("profiles").Update(map[string]interface{}{
		"blocked": req.Blocked,
	}).Eq("id", userID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to block/unblock user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// ResetUserMFA resets a user's MFA
func (h *AdminHandler) ResetUserMFA(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	userID = strings.TrimSuffix(userID, "/reset-mfa")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	// Note: This requires Supabase Admin API access
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "MFA reset requires Supabase Admin API integration",
	})
}

// ChangeUserPassword changes a user's password
func (h *AdminHandler) ChangeUserPassword(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	userID = strings.TrimSuffix(userID, "/password")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	// Note: This requires Supabase Admin API access
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Password change requires Supabase Admin API integration",
	})
}
