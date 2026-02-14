package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/nedpals/supabase-go"
)

// AdminOnly middleware ensures only admin users can access the endpoint
// Checks system_role in profiles table
func AdminOnly(supabaseClient *supabase.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get userID from context (set by Auth middleware)
			userID, ok := r.Context().Value(UserIDKey).(string)
			if !ok {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Fetch user profile to check system_role
			var profiles []struct {
				SystemRole string `json:"system_role"`
				Email      string `json:"email"`
			}

			err := supabaseClient.DB.From("profiles").
				Select("system_role, email").
				Eq("id", userID).
				Execute(&profiles)

			if err != nil {
				log.Printf("AdminOnly: Failed to fetch user profile: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			if len(profiles) == 0 {
				http.Error(w, "User profile not found", http.StatusForbidden)
				return
			}

			profile := profiles[0]

			// Check if user has platform_admin, admin (legacy), or super_admin role
			isAdmin := profile.SystemRole == "platform_admin" || profile.SystemRole == "admin" || profile.SystemRole == "super_admin"

			// Also allow SUPER_ADMIN_EMAIL from env (fallback)
			superAdminEmail := os.Getenv("SUPER_ADMIN_EMAIL")
			if superAdminEmail != "" && profile.Email == superAdminEmail {
				isAdmin = true
			}

			if !isAdmin {
				log.Printf("AdminOnly: Access denied for user %s (role: %s)", userID, profile.SystemRole)
				http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
				return
			}

			// User is admin, proceed
			log.Printf("AdminOnly: Access granted for user %s (role: %s)", userID, profile.SystemRole)
			next.ServeHTTP(w, r)
		})
	}
}

// RequireOrgRole middleware ensures user has specific role within an organization
// This can be used for org-level permissions (owner, admin, member)
func RequireOrgRole(supabaseClient *supabase.Client, allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, ok := r.Context().Value(UserIDKey).(string)
			if !ok {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Extract orgID from request (could be from URL param or body)
			// For now, we'll get the user's primary org
			var memberships []struct {
				Role  string `json:"role"`
				OrgID string `json:"org_id"`
			}

			err := supabaseClient.DB.From("org_memberships").
				Select("role, org_id").
				Eq("user_id", userID).
				Execute(&memberships)

			if err != nil || len(memberships) == 0 {
				http.Error(w, "Organization membership not found", http.StatusForbidden)
				return
			}

			userRole := memberships[0].Role

			// Check if user's role is in allowed roles
			roleAllowed := false
			for _, allowedRole := range allowedRoles {
				if userRole == allowedRole {
					roleAllowed = true
					break
				}
			}

			if !roleAllowed {
				http.Error(w, fmt.Sprintf("Forbidden: Requires one of roles: %v", allowedRoles), http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
