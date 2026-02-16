package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
)

type OrganizationHandler struct{}

func NewOrganizationHandler() *OrganizationHandler {
	return &OrganizationHandler{}
}

// GetMembers lists members of an organization with supervisor info and team assignments
func (h *OrganizationHandler) GetMembers(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	if orgID == "" {
		http.Error(w, "Org ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	// Fetch memberships with profile and supervisor info
	var members []map[string]interface{}
	err := client.DB.From("memberships").
		Select("id, role, user_id, status, job_title, supervisor_id, profiles(id, full_name, email, avatar_url, system_role)").
		Eq("org_id", orgID).
		Execute(&members)

	if err != nil {
		http.Error(w, "Failed to fetch members: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch all team_members for this org's teams to enrich member data
	var teamMembers []struct {
		TeamID string `json:"team_id"`
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}
	// Get team IDs for this org first
	var teams []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	client.DB.From("teams").Select("id, name").Eq("org_id", orgID).Execute(&teams)

	teamNameMap := make(map[string]string)
	for _, t := range teams {
		teamNameMap[t.ID] = t.Name
	}

	if len(teams) > 0 {
		// Fetch all team_members for these teams
		teamIDs := make([]string, len(teams))
		for i, t := range teams {
			teamIDs[i] = t.ID
		}
		for _, tid := range teamIDs {
			var tms []struct {
				TeamID string `json:"team_id"`
				UserID string `json:"user_id"`
				Role   string `json:"role"`
			}
			client.DB.From("team_members").Select("team_id, user_id, role").Eq("team_id", tid).Execute(&tms)
			teamMembers = append(teamMembers, tms...)
		}
	}

	// Build user -> teams mapping
	userTeams := make(map[string][]map[string]interface{})
	for _, tm := range teamMembers {
		userTeams[tm.UserID] = append(userTeams[tm.UserID], map[string]interface{}{
			"team_id":   tm.TeamID,
			"team_name": teamNameMap[tm.TeamID],
			"role":      tm.Role,
		})
	}

	// Build supervisor name lookup
	supervisorIDs := make(map[string]bool)
	for _, m := range members {
		if sid, ok := m["supervisor_id"].(string); ok && sid != "" {
			supervisorIDs[sid] = true
		}
	}
	supervisorNames := make(map[string]string)
	for sid := range supervisorIDs {
		var sup []struct {
			FullName string `json:"full_name"`
		}
		client.DB.From("profiles").Select("full_name").Eq("id", sid).Execute(&sup)
		if len(sup) > 0 {
			supervisorNames[sid] = sup[0].FullName
		}
	}

	// Enrich members with teams and supervisor name
	for i, m := range members {
		uid, _ := m["user_id"].(string)
		if ts, ok := userTeams[uid]; ok {
			members[i]["teams"] = ts
		} else {
			members[i]["teams"] = []map[string]interface{}{}
		}

		if sid, ok := m["supervisor_id"].(string); ok && sid != "" {
			members[i]["supervisor_name"] = supervisorNames[sid]
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}

// CreateMember creates a new user and adds them to the organization
func (h *OrganizationHandler) CreateMember(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	if orgID == "" {
		http.Error(w, "Org ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Email        string `json:"email"`
		Password     string `json:"password"`
		FullName     string `json:"full_name"`
		Role         string `json:"role"`
		SupervisorID string `json:"supervisor_id"`
		JobTitle     string `json:"job_title"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" || req.FullName == "" {
		http.Error(w, "Email, password, and full name are required", http.StatusBadRequest)
		return
	}

	if req.Role == "" {
		req.Role = "member"
	}

	// 1. Create user in Supabase Auth
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	adminUserBody := map[string]interface{}{
		"email":         req.Email,
		"password":      req.Password,
		"email_confirm": true,
		"user_metadata": map[string]interface{}{
			"full_name": req.FullName,
		},
	}

	jsonBody, _ := json.Marshal(adminUserBody)
	request, _ := http.NewRequest("POST", supabaseUrl+"/auth/v1/admin/users", bytes.NewBuffer(jsonBody))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+supabaseKey)
	request.Header.Set("apikey", supabaseKey)

	httpClient := &http.Client{}
	response, err := httpClient.Do(request)
	if err != nil {
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != 200 && response.StatusCode != 201 {
		bodyBytes, _ := io.ReadAll(response.Body)
		http.Error(w, "Auth error: "+string(bodyBytes), response.StatusCode)
		return
	}

	var authUser struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(response.Body).Decode(&authUser); err != nil {
		http.Error(w, "Failed to parse auth response", http.StatusInternalServerError)
		return
	}

	// 2. Update profile
	dbClient := database.GetClient()
	var profileResults []map[string]interface{}
	err = dbClient.DB.From("profiles").Update(map[string]interface{}{
		"full_name":   req.FullName,
		"system_role": "user",
	}).Eq("id", authUser.ID).Execute(&profileResults)
	if err != nil {
		log.Printf("Error updating profile for user %s: %v", authUser.ID, err)
	}

	// 3. Create membership
	membership := map[string]interface{}{
		"user_id": authUser.ID,
		"org_id":  orgID,
		"role":    req.Role,
		"status":  "active",
	}
	if req.SupervisorID != "" {
		membership["supervisor_id"] = req.SupervisorID
	}
	if req.JobTitle != "" {
		membership["job_title"] = req.JobTitle
	}

	var memberResults []map[string]interface{}
	err = dbClient.DB.From("memberships").Insert(membership).Execute(&memberResults)
	if err != nil {
		log.Printf("Error creating membership for user %s: %v", authUser.ID, err)
		http.Error(w, "User created but failed to add to organization: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"user_id": authUser.ID,
	})
}

// UpdateMember updates a member's role, supervisor, status, or job title
func (h *OrganizationHandler) UpdateMember(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	userID := r.PathValue("userId")

	if orgID == "" || userID == "" {
		http.Error(w, "Org ID and User ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Role         *string `json:"role"`
		SupervisorID *string `json:"supervisor_id"`
		Status       *string `json:"status"`
		JobTitle     *string `json:"job_title"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.SupervisorID != nil {
		if *req.SupervisorID == "" {
			updates["supervisor_id"] = nil
		} else {
			updates["supervisor_id"] = *req.SupervisorID
		}
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.JobTitle != nil {
		updates["job_title"] = *req.JobTitle
	}

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("memberships").Update(updates).Eq("user_id", userID).Eq("org_id", orgID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// RemoveMember removes a user from an organization
func (h *OrganizationHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	userID := r.PathValue("userId")

	if orgID == "" || userID == "" {
		http.Error(w, "Org ID and User ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	// Also remove from all teams in this org
	var teams []struct {
		ID string `json:"id"`
	}
	client.DB.From("teams").Select("id").Eq("org_id", orgID).Execute(&teams)
	for _, t := range teams {
		var tmr []map[string]interface{}
		client.DB.From("team_members").Delete().Eq("team_id", t.ID).Eq("user_id", userID).Execute(&tmr)
	}

	// Remove membership
	var results []map[string]interface{}
	err := client.DB.From("memberships").Delete().Eq("user_id", userID).Eq("org_id", orgID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to remove member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// GetTeams lists teams of an organization with member counts
func (h *OrganizationHandler) GetTeams(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")

	client := database.GetClient()
	var teams []map[string]interface{}

	err := client.DB.From("teams").Select("*").Eq("org_id", orgID).Execute(&teams)
	if err != nil {
		http.Error(w, "Failed to fetch teams: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Enrich with member counts and supervisor count
	for i, team := range teams {
		teamID := team["id"].(string)
		var tms []struct {
			UserID string `json:"user_id"`
			Role   string `json:"role"`
		}
		client.DB.From("team_members").Select("user_id, role").Eq("team_id", teamID).Execute(&tms)

		memberCount := 0
		supervisorCount := 0
		for _, tm := range tms {
			if tm.Role == "supervisor" {
				supervisorCount++
			}
			memberCount++
		}
		teams[i]["member_count"] = memberCount
		teams[i]["supervisor_count"] = supervisorCount
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

// UpdateTeam updates a team's name or description
func (h *OrganizationHandler) UpdateTeam(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("teamId")
	if teamID == "" {
		http.Error(w, "Team ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("teams").Update(updates).Eq("id", teamID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update team: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// DeleteTeam deletes a team
func (h *OrganizationHandler) DeleteTeam(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("teamId")
	if teamID == "" {
		http.Error(w, "Team ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("teams").Delete().Eq("id", teamID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to delete team: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// GetTeamMembers lists members of a team with profile info
func (h *OrganizationHandler) GetTeamMembers(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("teamId")
	if teamID == "" {
		http.Error(w, "Team ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var teamMembers []map[string]interface{}

	// team_members references auth.users, so we join via profiles
	err := client.DB.From("team_members").Select("team_id, user_id, role, assigned_at").Eq("team_id", teamID).Execute(&teamMembers)
	if err != nil {
		http.Error(w, "Failed to fetch team members: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Enrich with profile data
	for i, tm := range teamMembers {
		uid, _ := tm["user_id"].(string)
		var profile []struct {
			FullName  string `json:"full_name"`
			Email     string `json:"email"`
			AvatarURL string `json:"avatar_url"`
		}
		client.DB.From("profiles").Select("full_name, email, avatar_url").Eq("id", uid).Execute(&profile)
		if len(profile) > 0 {
			teamMembers[i]["full_name"] = profile[0].FullName
			teamMembers[i]["email"] = profile[0].Email
			teamMembers[i]["avatar_url"] = profile[0].AvatarURL
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teamMembers)
}

// AddTeamMember adds a user to a team
func (h *OrganizationHandler) AddTeamMember(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("teamId")
	if teamID == "" {
		http.Error(w, "Team ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}
	if req.Role == "" {
		req.Role = "member"
	}

	client := database.GetClient()
	var result []map[string]interface{}
	err := client.DB.From("team_members").Insert(map[string]interface{}{
		"team_id": teamID,
		"user_id": req.UserID,
		"role":    req.Role,
	}).Execute(&result)

	if err != nil {
		http.Error(w, "Failed to add team member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// RemoveTeamMember removes a user from a team
func (h *OrganizationHandler) RemoveTeamMember(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("teamId")
	userID := r.PathValue("userId")

	if teamID == "" || userID == "" {
		http.Error(w, "Team ID and User ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("team_members").Delete().Eq("team_id", teamID).Eq("user_id", userID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to remove team member: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// UpdateTeamMemberRole updates a team member's role (member/supervisor)
func (h *OrganizationHandler) UpdateTeamMemberRole(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("teamId")
	userID := r.PathValue("userId")

	if teamID == "" || userID == "" {
		http.Error(w, "Team ID and User ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.Role != "member" && req.Role != "supervisor" {
		http.Error(w, "Role must be 'member' or 'supervisor'", http.StatusBadRequest)
		return
	}

	client := database.GetClient()
	var results []map[string]interface{}
	err := client.DB.From("team_members").Update(map[string]interface{}{
		"role": req.Role,
	}).Eq("team_id", teamID).Eq("user_id", userID).Execute(&results)

	if err != nil {
		http.Error(w, "Failed to update role: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
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

// GetUserMemberships returns the current user's org memberships
func (h *OrganizationHandler) GetUserMemberships(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	if userID == "" {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	client := database.GetClient()
	var memberships []map[string]interface{}

	err := client.DB.From("memberships").
		Select("org_id, role, organizations(id, name, slug)").
		Eq("user_id", userID).
		Execute(&memberships)

	if err != nil {
		http.Error(w, "Failed to fetch memberships: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(memberships)
}

// GetAssignees searches for users and teams to assign (scoped to org members)
func (h *OrganizationHandler) GetAssignees(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	query := r.URL.Query().Get("query")
	query = "%" + query + "%"

	client := database.GetClient()
	var results []map[string]interface{}

	// 1. Fetch org members (scoped to this org, not all profiles)
	var memberships []struct {
		UserID string `json:"user_id"`
	}
	client.DB.From("memberships").Select("user_id").Eq("org_id", orgID).Eq("status", "active").Execute(&memberships)

	// Fetch profiles for these members
	for _, m := range memberships {
		var users []struct {
			ID       string `json:"id"`
			FullName string `json:"full_name"`
			Email    string `json:"email"`
		}
		client.DB.From("profiles").Select("id, full_name, email").Eq("id", m.UserID).Ilike("full_name", query).Execute(&users)
		for _, u := range users {
			results = append(results, map[string]interface{}{
				"id":     u.ID,
				"type":   "user",
				"name":   u.FullName,
				"avatar": "",
				"info":   u.Email,
			})
		}
	}

	// 2. Fetch Teams
	var teams []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	err := client.DB.From("teams").Select("id, name").Limit(50).Eq("org_id", orgID).Ilike("name", query).Execute(&teams)
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
