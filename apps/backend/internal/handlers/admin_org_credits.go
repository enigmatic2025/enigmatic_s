package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/sirupsen/logrus"
	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
)

type OrgCreditsHandler struct {
	logger *logrus.Logger
}

func NewOrgCreditsHandler() *OrgCreditsHandler {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})
	return &OrgCreditsHandler{
		logger: logger,
	}
}

// SetCreditsPayload for updating org credits
type SetCreditsPayload struct {
	Credits int `json:"credits"` // Can be negative to deduct
}

// SetUnlimitedPayload for toggling unlimited access
type SetUnlimitedPayload struct {
	Unlimited bool `json:"unlimited"`
}

// SetOrgCredits handles PUT /api/admin/orgs/:id/credits
// Sets the AI credits balance to a specific amount
func (h *OrgCreditsHandler) SetOrgCredits(w http.ResponseWriter, r *http.Request) {
	// Get org ID from URL path
	orgID := r.PathValue("id")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	// Parse request body
	var payload SetCreditsPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get request logger
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	requestID := middleware.GetRequestID(r.Context())
	logger := h.logger.WithFields(logrus.Fields{
		"request_id": requestID,
		"admin_id":   userID,
		"org_id":     orgID,
		"credits":    payload.Credits,
	})

	logger.Info("Admin setting org credits")

	// Update credits in database
	client := database.GetClient()
	var result []map[string]interface{}

	err := client.DB.From("organizations").
		Update(map[string]interface{}{
			"ai_credits_balance": payload.Credits,
		}).
		Eq("id", orgID).
		Execute(&result)

	if err != nil {
		logger.WithError(err).Error("Failed to update org credits")
		http.Error(w, "Failed to update credits", http.StatusInternalServerError)
		return
	}

	if len(result) == 0 {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	logger.Info("Org credits updated successfully")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Credits set to %d", payload.Credits),
		"credits": payload.Credits,
	})
}

// AddOrgCredits handles POST /api/admin/orgs/:id/credits/add
// Adds credits to existing balance (can be negative to deduct)
func (h *OrgCreditsHandler) AddOrgCredits(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("id")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	var payload SetCreditsPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	requestID := middleware.GetRequestID(r.Context())
	logger := h.logger.WithFields(logrus.Fields{
		"request_id": requestID,
		"admin_id":   userID,
		"org_id":     orgID,
		"add_credits": payload.Credits,
	})

	logger.Info("Admin adding credits to org")

	// Get current balance
	client := database.GetClient()
	var orgs []struct {
		AICreditsBalance int `json:"ai_credits_balance"`
	}

	err := client.DB.From("organizations").
		Select("ai_credits_balance").
		Eq("id", orgID).
		Execute(&orgs)

	if err != nil || len(orgs) == 0 {
		logger.WithError(err).Error("Failed to fetch org")
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	currentBalance := orgs[0].AICreditsBalance
	newBalance := currentBalance + payload.Credits

	// Update with new balance
	var result []map[string]interface{}
	err = client.DB.From("organizations").
		Update(map[string]interface{}{
			"ai_credits_balance": newBalance,
		}).
		Eq("id", orgID).
		Execute(&result)

	if err != nil {
		logger.WithError(err).Error("Failed to add credits")
		http.Error(w, "Failed to add credits", http.StatusInternalServerError)
		return
	}

	logger.WithFields(logrus.Fields{
		"old_balance": currentBalance,
		"new_balance": newBalance,
	}).Info("Credits added successfully")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"message":     fmt.Sprintf("Added %d credits", payload.Credits),
		"old_balance": currentBalance,
		"new_balance": newBalance,
	})
}

// SetUnlimitedAccess handles PUT /api/admin/orgs/:id/unlimited
// Toggles unlimited AI access for an organization
func (h *OrgCreditsHandler) SetUnlimitedAccess(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("id")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	var payload SetUnlimitedPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	requestID := middleware.GetRequestID(r.Context())
	logger := h.logger.WithFields(logrus.Fields{
		"request_id": requestID,
		"admin_id":   userID,
		"org_id":     orgID,
		"unlimited":  payload.Unlimited,
	})

	logger.Info("Admin toggling unlimited AI access")

	// Update unlimited access flag
	client := database.GetClient()
	var result []map[string]interface{}

	err := client.DB.From("organizations").
		Update(map[string]interface{}{
			"ai_unlimited_access": payload.Unlimited,
		}).
		Eq("id", orgID).
		Execute(&result)

	if err != nil {
		logger.WithError(err).Error("Failed to update unlimited access")
		http.Error(w, "Failed to update unlimited access", http.StatusInternalServerError)
		return
	}

	if len(result) == 0 {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	logger.Info("Unlimited access updated successfully")

	status := "disabled"
	if payload.Unlimited {
		status = "enabled"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   fmt.Sprintf("Unlimited access %s", status),
		"unlimited": payload.Unlimited,
	})
}

// GetOrgCreditsStats handles GET /api/admin/orgs/:id/credits/stats
// Returns detailed credit usage statistics for an organization
func (h *OrgCreditsHandler) GetOrgCreditsStats(w http.ResponseWriter, r *http.Request) {
	orgID := r.PathValue("id")
	if orgID == "" {
		http.Error(w, "Organization ID required", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	// Get org info
	var orgs []struct {
		Name              string `json:"name"`
		AICreditsBalance  int    `json:"ai_credits_balance"`
		AIUnlimitedAccess *bool  `json:"ai_unlimited_access"`
	}

	err := client.DB.From("organizations").
		Select("name, ai_credits_balance, ai_unlimited_access").
		Eq("id", orgID).
		Execute(&orgs)

	if err != nil || len(orgs) == 0 {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	org := orgs[0]
	unlimited := false
	if org.AIUnlimitedAccess != nil {
		unlimited = *org.AIUnlimitedAccess
	}

	// Get usage stats from ai_usage_log
	var logs []struct {
		TotalTokens     int    `json:"total_tokens"`
		CreditsCharged  int    `json:"credits_charged"`
		GuardrailResult string `json:"guardrail_result"`
	}

	err = client.DB.From("ai_usage_log").
		Select("total_tokens, credits_charged, guardrail_result").
		Eq("org_id", orgID).
		Execute(&logs)

	totalTokens := 0
	totalCreditsUsed := 0
	blockedRequests := 0

	for _, log := range logs {
		totalTokens += log.TotalTokens
		totalCreditsUsed += log.CreditsCharged
		if log.GuardrailResult == "blocked" {
			blockedRequests++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"org_name":          org.Name,
		"current_balance":   org.AICreditsBalance,
		"unlimited_access":  unlimited,
		"total_tokens_used": totalTokens,
		"total_credits_used": totalCreditsUsed,
		"total_requests":    len(logs),
		"blocked_requests":  blockedRequests,
	})
}
