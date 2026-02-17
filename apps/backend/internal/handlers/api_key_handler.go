package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type ApiKeyHandler struct{}

func NewApiKeyHandler() *ApiKeyHandler {
	return &ApiKeyHandler{}
}

type CreateApiKeyRequest struct {
	Label string `json:"label"`
}

// CreateApiKey generates a new API key for the organization.
// POST /api/orgs/{orgId}/api-keys
func (h *ApiKeyHandler) CreateApiKey(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	var req CreateApiKeyRequest
	if r.ContentLength > 0 {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
	}

	// Generate raw key: enig_ + 32 random hex chars
	rawBytes := make([]byte, 16)
	if _, err := rand.Read(rawBytes); err != nil {
		http.Error(w, "Failed to generate key", http.StatusInternalServerError)
		return
	}
	rawKey := fmt.Sprintf("enig_%x", rawBytes)

	// Hash with SHA-256 for storage
	hash := sha256.Sum256([]byte(rawKey))
	keyHash := fmt.Sprintf("%x", hash)

	// Insert into api_keys table
	dbClient := database.GetClient()
	record := map[string]interface{}{
		"org_id":   orgID,
		"key_hash": keyHash,
		"label":    req.Label,
	}

	var results []map[string]interface{}
	err := dbClient.DB.From("api_keys").Insert(record).Execute(&results)
	if err != nil {
		http.Error(w, "Failed to create API key: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the raw key (only time it's ever shown)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    results[0]["id"],
		"key":   rawKey,
		"label": req.Label,
	})
}

// ListApiKeys returns all API keys for the organization (without the raw key).
// GET /api/orgs/{orgId}/api-keys
func (h *ApiKeyHandler) ListApiKeys(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()
	var results []map[string]interface{}
	err := dbClient.DB.From("api_keys").Select("id, label, last_used_at, created_at").Eq("org_id", orgID).Execute(&results)
	if err != nil {
		http.Error(w, "Failed to list API keys: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// DeleteApiKey revokes an API key.
// DELETE /api/orgs/{orgId}/api-keys/{id}
func (h *ApiKeyHandler) DeleteApiKey(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("orgId")
	keyID := r.PathValue("id")
	if orgID == "" || keyID == "" {
		http.Error(w, "Organization ID and key ID required", http.StatusBadRequest)
		return
	}

	dbClient := database.GetClient()
	var results []map[string]interface{}
	err := dbClient.DB.From("api_keys").Delete().Eq("id", keyID).Eq("org_id", orgID).Execute(&results)
	if err != nil {
		http.Error(w, "Failed to delete API key: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
