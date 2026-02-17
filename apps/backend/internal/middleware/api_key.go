package middleware

import (
	"context"
	"crypto/sha256"
	"fmt"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

const OrgIDKey ContextKey = "orgID"

// GetOrgID extracts the org ID from context (set by ApiKeyAuth middleware).
// Returns the org ID and true if present, or empty string and false if not.
func GetOrgID(ctx context.Context) (string, bool) {
	orgID, ok := ctx.Value(OrgIDKey).(string)
	return orgID, ok && orgID != ""
}

// ApiKeyAuth validates the X-API-Key header against the api_keys table.
// On success, it sets the org ID in context and calls the next handler.
func ApiKeyAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-Key")
		if apiKey == "" {
			http.Error(w, "Missing X-API-Key header", http.StatusUnauthorized)
			return
		}

		// Hash the key with SHA-256
		hash := sha256.Sum256([]byte(apiKey))
		keyHash := fmt.Sprintf("%x", hash)

		// Look up the hash in api_keys table
		dbClient := database.GetClient()
		var results []struct {
			ID    string `json:"id"`
			OrgID string `json:"org_id"`
		}
		err := dbClient.DB.From("api_keys").Select("id, org_id").Eq("key_hash", keyHash).Execute(&results)
		if err != nil || len(results) == 0 {
			http.Error(w, "Invalid API key", http.StatusUnauthorized)
			return
		}

		// Update last_used_at (fire-and-forget, don't block the request)
		go func() {
			var updateResult []map[string]interface{}
			dbClient.DB.From("api_keys").Update(map[string]interface{}{
				"last_used_at": "now()",
			}).Eq("id", results[0].ID).Execute(&updateResult)
		}()

		// Set org ID in context
		ctx := context.WithValue(r.Context(), OrgIDKey, results[0].OrgID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
