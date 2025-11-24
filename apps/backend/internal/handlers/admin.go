package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
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
	// Fetching 'subscription_plan' as it exists in schema.sql
	err := client.DB.From("organizations").Select("id, name, slug, subscription_plan, created_at").Execute(&orgs)

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
		"subscription_plan": req.Plan,
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
		updates["subscription_plan"] = req.Plan
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

	// 1. Create user in Supabase Auth via Admin API
	// We need to use the Admin API to create a user without signing them in
	// and to skip email confirmation if desired (we'll auto-confirm for admin creation)
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	
	// Create user payload
	adminUserBody := map[string]interface{}{
		"email":          req.Email,
		"password":       req.Password,
		"email_confirm":  true,
		"user_metadata": map[string]interface{}{
			"full_name": req.FullName,
		},
	}
	
	jsonBody, _ := json.Marshal(adminUserBody)
	
	// Make request to Supabase Auth Admin API
	request, _ := http.NewRequest("POST", supabaseUrl+"/auth/v1/admin/users", bytes.NewBuffer(jsonBody))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+supabaseKey)
	request.Header.Set("apikey", supabaseKey)
	
	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		http.Error(w, "Failed to call Supabase Auth API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()
	
	if response.StatusCode != 200 && response.StatusCode != 201 {
		bodyBytes, _ := io.ReadAll(response.Body)
		http.Error(w, "Supabase Auth Error: "+string(bodyBytes), response.StatusCode)
		return
	}
	
	var authUser struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(response.Body).Decode(&authUser); err != nil {
		http.Error(w, "Failed to parse auth response", http.StatusInternalServerError)
		return
	}

	// 2. Update Profile (System Role)
	dbClient := database.GetClient()
	
	profileUpdates := map[string]interface{}{
		"full_name": req.FullName,
	}
	
	if req.UserType == "system" {
		profileUpdates["system_role"] = "admin"
	} else {
		profileUpdates["system_role"] = "user"
	}
	
	var profileResults []map[string]interface{}
	err = dbClient.DB.From("profiles").Update(profileUpdates).Eq("id", authUser.ID).Execute(&profileResults)
	if err != nil {
		// Log error but don't fail request as user is created
		log.Printf("Error updating profile for user %s: %v", authUser.ID, err)
	}

	// 3. Create Membership (if Standard User or System Admin with Enigmatic org)
	if req.OrganizationID != "" {
		// For System Admins, we force role to 'member' in the Enigmatic org (as per frontend logic)
		// For Standard Users, we use the requested role
		orgRole := req.Role
		if req.UserType == "system" {
			orgRole = "member" // System admins are just members of the Enigmatic org
		}

		var memberResults []map[string]interface{}
		err = dbClient.DB.From("memberships").Insert(map[string]interface{}{
			"user_id": authUser.ID,
			"org_id":  req.OrganizationID,
			"role":    orgRole,
		}).Execute(&memberResults)
		
		if err != nil {
			log.Printf("Error creating membership for user %s: %v", authUser.ID, err)
			// We might want to return a warning or error here, but user is created
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success", 
		"message": "User created successfully",
		"user_id": authUser.ID,
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
		Email      string `json:"email"`
		FullName   string `json:"full_name"`
		SystemRole string `json:"system_role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})
	if req.FullName != "" {
		updates["full_name"] = req.FullName
	}
	if req.SystemRole != "" {
		// Validate role
		if req.SystemRole != "admin" && req.SystemRole != "user" {
			http.Error(w, "Invalid system role. Must be 'admin' or 'user'", http.StatusBadRequest)
			return
		}
		updates["system_role"] = req.SystemRole
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

	// 1. Delete from Supabase Auth
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	request, _ := http.NewRequest("DELETE", supabaseUrl+"/auth/v1/admin/users/"+userID, nil)
	request.Header.Set("Authorization", "Bearer "+supabaseKey)
	request.Header.Set("apikey", supabaseKey)

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		http.Error(w, "Failed to call Supabase Auth API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(response.Body)
		http.Error(w, "Supabase Auth Error: "+string(bodyBytes), response.StatusCode)
		return
	}

	// 2. Delete from Database (Profiles) - Cascade should handle memberships
	// Note: Supabase Auth deletion might trigger a cascade if configured, but we'll ensure DB cleanup
	dbClient := database.GetClient()
	var results []map[string]interface{}
	err = dbClient.DB.From("profiles").Delete().Eq("id", userID).Execute(&results)
	if err != nil {
		// Log but don't fail as Auth deletion was successful
		log.Printf("Error deleting profile for user %s: %v", userID, err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "User deleted successfully",
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

	// 1. Update Supabase Auth Ban Status
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	var banDuration string
	if req.Blocked {
		banDuration = "876000h" // ~100 years
	} else {
		banDuration = "0s" // Unban
	}

	jsonBody, _ := json.Marshal(map[string]interface{}{
		"ban_duration": banDuration,
	})

	request, _ := http.NewRequest("PUT", supabaseUrl+"/auth/v1/admin/users/"+userID, bytes.NewBuffer(jsonBody))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+supabaseKey)
	request.Header.Set("apikey", supabaseKey)

	httpClient := &http.Client{}
	response, err := httpClient.Do(request)
	if err != nil {
		http.Error(w, "Failed to call Supabase Auth API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(response.Body)
		http.Error(w, "Supabase Auth Error: "+string(bodyBytes), response.StatusCode)
		return
	}

	// 2. Update Database Profile
	client := database.GetClient()
	var results []map[string]interface{}
	err = client.DB.From("profiles").Update(map[string]interface{}{
		"blocked": req.Blocked,
	}).Eq("id", userID).Execute(&results)

	if err != nil {
		log.Printf("Error updating profile block status for user %s: %v", userID, err)
		// Don't fail request as Auth ban was successful
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

	// Remove all MFA factors for the user
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	// First, list factors (optional, but good to know what we're deleting)
	// Or just try to delete known types. Supabase Admin API allows deleting factors by ID.
	// Since we want to reset ALL, we might need to list first.
	// Endpoint: GET /auth/v1/admin/users/{id}/factors
	
	request, _ := http.NewRequest("GET", supabaseUrl+"/auth/v1/admin/users/"+userID+"/factors", nil)
	request.Header.Set("Authorization", "Bearer "+supabaseKey)
	request.Header.Set("apikey", supabaseKey)

	httpClient := &http.Client{}
	response, err := httpClient.Do(request)
	if err != nil {
		http.Error(w, "Failed to list MFA factors: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		// If listing fails, we can't delete.
		bodyBytes, _ := io.ReadAll(response.Body)
		http.Error(w, "Supabase Auth Error (List Factors): "+string(bodyBytes), response.StatusCode)
		return
	}

	var factors []struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(response.Body).Decode(&factors); err != nil {
		http.Error(w, "Failed to parse factors", http.StatusInternalServerError)
		return
	}

	// Delete each factor
	for _, factor := range factors {
		delReq, _ := http.NewRequest("DELETE", supabaseUrl+"/auth/v1/admin/users/"+userID+"/factors/"+factor.ID, nil)
		delReq.Header.Set("Authorization", "Bearer "+supabaseKey)
		delReq.Header.Set("apikey", supabaseKey)
		
		delResp, err := httpClient.Do(delReq)
		if err != nil || delResp.StatusCode != 200 {
			log.Printf("Failed to delete factor %s for user %s", factor.ID, userID)
		}
		if delResp != nil {
			delResp.Body.Close()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "MFA factors reset successfully",
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

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	jsonBody, _ := json.Marshal(map[string]interface{}{
		"password": req.Password,
	})

	request, _ := http.NewRequest("PUT", supabaseUrl+"/auth/v1/admin/users/"+userID, bytes.NewBuffer(jsonBody))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+supabaseKey)
	request.Header.Set("apikey", supabaseKey)

	httpClient := &http.Client{}
	response, err := httpClient.Do(request)
	if err != nil {
		http.Error(w, "Failed to call Supabase Auth API: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(response.Body)
		http.Error(w, "Supabase Auth Error: "+string(bodyBytes), response.StatusCode)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Password changed successfully",
	})
}

// UpdateUserRole updates a user's organization role
func (h *AdminHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	userID = strings.TrimSuffix(userID, "/role")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Role string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Role == "" {
		http.Error(w, "Role is required", http.StatusBadRequest)
		return
	}

	// Update memberships table
	// Note: This assumes user has only one membership for now, or we update all.
	// Ideally we should specify org_id, but for this simple admin panel we might just update their role in whatever org they are in.
	// Or we can look up their membership.
	
	client := database.GetClient()
	var results []map[string]interface{}
	
	// We update all memberships for this user to the new role. 
	// In a multi-org system, this might be dangerous, but for this requirement it seems acceptable 
	// as the UI implies a single "Role" column.
	err := client.DB.From("memberships").Update(map[string]interface{}{
		"role": req.Role,
	}).Eq("user_id", userID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update user role: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "User role updated successfully",
	})
}
