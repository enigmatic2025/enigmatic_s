package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
	"github.com/teavana/enigmatic_s/apps/backend/internal/services"
)

type AIHandler struct {
	aiService *services.AIService
}

func NewAIHandler(aiService *services.AIService) *AIHandler {
	return &AIHandler{aiService: aiService}
}

// ChatPayload defines the request structure for chat endpoints
type ChatPayload struct {
	Message  string      `json:"message"`            // Legacy single message
	Messages []UIMessage `json:"messages,omitempty"` // Vercel AI SDK format
	Context  string      `json:"context"`            // Optional context
}

type UIMessage struct {
	Role    string   `json:"role"`
	Content string   `json:"content"`
	Parts   []UIPart `json:"parts,omitempty"`
}

type UIPart struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

type ConfigPayload struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// ChatHandler handles POST /api/ai/chat (non-streaming)
func (h *AIHandler) ChatHandler(w http.ResponseWriter, r *http.Request) {
	var payload ChatPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Extract message from Messages array if Message is empty
	if payload.Message == "" && len(payload.Messages) > 0 {
		// Taking the last message as the new prompt
		lastMsg := payload.Messages[len(payload.Messages)-1]
		if lastMsg.Role == "user" {
			if lastMsg.Content != "" {
				payload.Message = lastMsg.Content
			} else if len(lastMsg.Parts) > 0 {
				for _, p := range lastMsg.Parts {
					if p.Type == "text" {
						payload.Message += p.Text
					}
				}
			}
		}
	}

	if payload.Message == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	// Validate message length (prevent abuse)
	const MaxMessageLength = 10000 // 10k characters
	if len(payload.Message) > MaxMessageLength {
		http.Error(w, fmt.Sprintf("Message too long (max %d characters)", MaxMessageLength), http.StatusBadRequest)
		return
	}

	// Sanitize message (remove null bytes and control characters)
	payload.Message = sanitizeInput(payload.Message)

	// 1. Get user ID from auth context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Look up user's organization
	orgID, err := h.aiService.GetUserOrgID(userID)
	if err != nil {
		log.Printf("AI Chat: failed to get org for user %s: %v", userID, err)
		http.Error(w, "User has no organization membership", http.StatusForbidden)
		return
	}

	// 3. Check and deduct credits
	if err := h.aiService.CheckAndDeductCredits(orgID, 1); err != nil {
		log.Printf("AI Chat: credit check failed for org %s: %v", orgID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "insufficient_credits",
			"message": "Your organization has run out of AI credits. Please contact your administrator.",
		})
		return
	}

	// 4. Run guardrail classification
	allowed, reason, err := h.aiService.ClassifyPrompt(r.Context(), payload.Message)
	if err != nil {
		log.Printf("AI Chat: guardrail error (allowing through): %v", err)
	}

	if !allowed {
		// Log the blocked attempt (refund the credit)
		h.aiService.LogUsage(userID, orgID, "guardrail", "blocked", 0, 0, 0, 0)
		// Refund the credit since we blocked it
		h.aiService.CheckAndDeductCredits(orgID, -1) // negative cost = refund

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "guardrail_blocked",
			"message": reason,
		})
		return
	}

	// 5. Fetch Context Details
	userName, userRole, _ := h.aiService.GetUserProfile(userID)
	orgName, orgSlug, _ := h.aiService.GetOrgDetails(orgID)

	// 6. Build system prompt
	systemPrompt := buildSystemPrompt(userName, userRole, orgName, orgSlug, payload.Context)

	// 7. Generate response
	response, usage, err := h.aiService.GenerateResponse(r.Context(), systemPrompt, payload.Message)
	if err != nil {
		log.Printf("AI Chat: generation error: %v", err)
		http.Error(w, "AI Service Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 8. Log usage
	promptTokens, completionTokens, totalTokens := 0, 0, 0
	if usage != nil {
		promptTokens = usage.PromptTokens
		completionTokens = usage.CompletionTokens
		totalTokens = usage.TotalTokens
	}
	config := h.aiService.GetConfig()
	h.aiService.LogUsage(userID, orgID, config.Model, "allowed", promptTokens, completionTokens, totalTokens, 1)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"response": response,
		"usage": map[string]int{
			"prompt_tokens":     promptTokens,
			"completion_tokens": completionTokens,
			"total_tokens":      totalTokens,
		},
	})
}

// StreamChatHandler handles POST /api/ai/chat/stream (SSE streaming)
func (h *AIHandler) StreamChatHandler(w http.ResponseWriter, r *http.Request) {
	var payload ChatPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Extract message from Messages array if Message is empty
	if payload.Message == "" && len(payload.Messages) > 0 {
		// Taking the last message as the new prompt
		// In a real Vercel AI implementation we might want to pass history,
		// but AI Service currently takes a single prompt.
		lastMsg := payload.Messages[len(payload.Messages)-1]
		if lastMsg.Role == "user" {
			payload.Message = lastMsg.Content
		}
	}

	if payload.Message == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	// Validate message length (prevent abuse)
	const MaxMessageLength = 10000 // 10k characters
	if len(payload.Message) > MaxMessageLength {
		http.Error(w, fmt.Sprintf("Message too long (max %d characters)", MaxMessageLength), http.StatusBadRequest)
		return
	}

	// Sanitize message (remove null bytes and control characters)
	payload.Message = sanitizeInput(payload.Message)

	// 1. Get user ID
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Look up org
	orgID, err := h.aiService.GetUserOrgID(userID)
	if err != nil {
		http.Error(w, "User has no organization membership", http.StatusForbidden)
		return
	}

	// 3. Check credits
	if err := h.aiService.CheckAndDeductCredits(orgID, 1); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "insufficient_credits",
			"message": "Your organization has run out of AI credits.",
		})
		return
	}

	// 4. Guardrail
	allowed, reason, _ := h.aiService.ClassifyPrompt(r.Context(), payload.Message)
	if !allowed {
		h.aiService.LogUsage(userID, orgID, "guardrail", "blocked", 0, 0, 0, 0)
		h.aiService.CheckAndDeductCredits(orgID, -1)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "guardrail_blocked",
			"message": reason,
		})
		return
	}

	// 5. Fetch Context Details
	userName, userRole, _ := h.aiService.GetUserProfile(userID)
	orgName, orgSlug, _ := h.aiService.GetOrgDetails(orgID)

	// 6. Build system prompt
	systemPrompt := buildSystemPrompt(userName, userRole, orgName, orgSlug, payload.Context)

	// 7. Stream response
	usage, err := h.aiService.GenerateStreamingResponse(r.Context(), w, systemPrompt, payload.Message)
	if err != nil {
		log.Printf("AI Stream: generation error: %v", err)
		// If headers haven't been sent yet, we can send an error
		http.Error(w, "AI Service Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 8. Log usage
	promptTokens, completionTokens, totalTokens := 0, 0, 0
	if usage != nil {
		promptTokens = usage.PromptTokens
		completionTokens = usage.CompletionTokens
		totalTokens = usage.TotalTokens
	}
	config := h.aiService.GetConfig()
	h.aiService.LogUsage(userID, orgID, config.Model, "allowed", promptTokens, completionTokens, totalTokens, 1)
}

// GetConfigHandler handles GET /api/admin/ai-config
func (h *AIHandler) GetConfigHandler(w http.ResponseWriter, r *http.Request) {
	config := h.aiService.GetConfig()

	// Obfuscate API Key
	if len(config.APIKey) > 4 {
		config.APIKey = "..." + config.APIKey[len(config.APIKey)-4:]
	} else {
		config.APIKey = "****"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

// UpdateConfigHandler handles PUT /api/admin/ai-config
func (h *AIHandler) UpdateConfigHandler(w http.ResponseWriter, r *http.Request) {
	var payload ConfigPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.aiService.UpdateConfig(payload.Key, payload.Value); err != nil {
		http.Error(w, "Failed to update config: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

// GetAIStatsHandler handles GET /api/admin/ai-stats
func (h *AIHandler) GetAIStatsHandler(w http.ResponseWriter, r *http.Request) {
	type UsageStats struct {
		TotalRequests int `json:"total_requests"`
		TotalTokens   int `json:"total_tokens"`
		BlockedCount  int `json:"blocked_count"`
		CreditsUsed   int `json:"credits_used"`
	}

	// Query aggregated stats from ai_usage_log
	// We'll use raw counts since supabase-go doesn't support aggregate functions directly
	var logs []struct {
		TotalTokens     int    `json:"total_tokens"`
		GuardrailResult string `json:"guardrail_result"`
		CreditsCharged  int    `json:"credits_charged"`
	}

	err := h.aiService.GetClient().DB.From("ai_usage_log").Select("total_tokens, guardrail_result, credits_charged").Execute(&logs)
	if err != nil {
		log.Printf("AI Stats: failed to fetch usage logs: %v", err)
		// Return zeros if query fails
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(UsageStats{})
		return
	}

	stats := UsageStats{}
	for _, l := range logs {
		stats.TotalRequests++
		stats.TotalTokens += l.TotalTokens
		stats.CreditsUsed += l.CreditsCharged
		if l.GuardrailResult == "blocked" {
			stats.BlockedCount++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// buildSystemPrompt constructs the system prompt with optional context
func buildSystemPrompt(userName, userRole, orgName, orgSlug, contextData string) string {
	timestamp := time.Now().Format(time.RFC1123)

	prompt := fmt.Sprintf(`You are Natalie, an expert automation and workflow assistant for the Enigmatic platform.

Current Context:
- Time: %s
- User: %s (%s)
- Organization: %s
- Access Level: %s

Your role:
- Help users understand their automation workflows, action flows, and execution results
- Analyze errors, failures, and suggest fixes for automation runs
- Provide clear, concise, and professional answers
- When analyzing flow data, focus on actionable insights

Guidelines:
- Be concise but thorough
- Use bullet points for lists
- When explaining errors, suggest specific solutions
- Reference specific step names and data when available
- If you don't have enough context, ask for clarification`,
		timestamp, userName, userRole, orgName,
		func() string {
			if orgSlug == "enigmatic-i2v2i" {
				return "SUPER ADMIN (Access to ALL organizations and system data)"
			}
			return "STANDARD (Access restricted to current organization only)"
		}())

	if contextData != "" {
		prompt += "\n\n## Additional Data Context\n" + contextData
	}

	return prompt
}

// sanitizeInput removes potentially harmful characters from user input
func sanitizeInput(input string) string {
	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")

	// Remove control characters except newlines, tabs, and carriage returns
	var cleaned strings.Builder
	cleaned.Grow(len(input))

	for _, r := range input {
		// Allow printable characters, newlines, tabs, and carriage returns
		if unicode.IsPrint(r) || r == '\n' || r == '\t' || r == '\r' {
			cleaned.WriteRune(r)
		}
	}

	return cleaned.String()
}
