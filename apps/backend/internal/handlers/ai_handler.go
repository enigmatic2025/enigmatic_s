package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/sirupsen/logrus"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
	"github.com/teavana/enigmatic_s/apps/backend/internal/services"
)

type AIHandler struct {
	aiService *services.AIService
	logger    *logrus.Logger
}

func NewAIHandler(aiService *services.AIService) *AIHandler {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{}) // JSON format for structured logging
	return &AIHandler{
		aiService: aiService,
		logger:    logger,
	}
}

// getRequestLogger creates a logger with contextual fields (request ID, user ID, org ID)
func (h *AIHandler) getRequestLogger(r *http.Request, userID, orgID string) *logrus.Entry {
	requestID := middleware.GetRequestID(r.Context())
	return h.logger.WithFields(logrus.Fields{
		"request_id": requestID,
		"user_id":    userID,
		"org_id":     orgID,
		"path":       r.URL.Path,
		"method":     r.Method,
	})
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
		logger := h.getRequestLogger(r, userID, "")
		logger.WithError(err).Error("Failed to get organization for user")
		http.Error(w, "User has no organization membership", http.StatusForbidden)
		return
	}

	// Create structured logger with full context
	logger := h.getRequestLogger(r, userID, orgID)
	logger.Info("AI chat request received")

	// 3. Check and deduct credits
	if err := h.aiService.CheckAndDeductCredits(orgID, 1); err != nil {
		logger.WithError(err).Warn("Credit check failed")
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
		logger.WithError(err).Warn("Guardrail error (allowing through)")
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

	// 6.5 Build tool context
	toolCtx := services.ToolContext{
		OrgID:        orgID,
		OrgSlug:      orgSlug,
		IsSuperAdmin: orgSlug == "enigmatic-i2v2i",
		Client:       h.aiService.GetClient(),
		Logger:       h.logger,
	}
	tools := services.GetToolDefinitions()

	// 7. Generate response with tool-calling loop
	response, usage, err := h.aiService.GenerateWithToolLoop(r.Context(), systemPrompt, payload.Message, tools, toolCtx)
	if err != nil {
		logger.WithError(err).Error("AI generation failed")
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

	// Log successful completion
	logger.WithFields(logrus.Fields{
		"model":             config.Model,
		"prompt_tokens":     promptTokens,
		"completion_tokens": completionTokens,
		"total_tokens":      totalTokens,
	}).Info("AI chat request completed successfully")

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

	// 6.5 Build tool context
	toolCtx := services.ToolContext{
		OrgID:        orgID,
		OrgSlug:      orgSlug,
		IsSuperAdmin: orgSlug == "enigmatic-i2v2i",
		Client:       h.aiService.GetClient(),
		Logger:       h.logger,
	}
	tools := services.GetToolDefinitions()

	// 7. Stream response with tool-calling loop
	usage, err := h.aiService.GenerateStreamingWithToolLoop(r.Context(), w, systemPrompt, payload.Message, tools, toolCtx)
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
// SECURITY: Never returns API keys - only config status
func (h *AIHandler) GetConfigHandler(w http.ResponseWriter, r *http.Request) {
	config := h.aiService.GetConfig()

	// Create safe response without API key
	safeConfig := struct {
		Provider           string `json:"provider"`
		Model              string `json:"model"`
		BaseURL            string `json:"base_url"`
		APIKeyConfigured   bool   `json:"api_key_configured"`   // Just indicates if key exists
		GuardrailEnabled   bool   `json:"guardrail_enabled"`
		GuardrailProvider  string `json:"guardrail_provider"`
		GuardrailModel     string `json:"guardrail_model"`
		GuardrailBaseURL   string `json:"guardrail_base_url"`
	}{
		Provider:           config.Provider,
		Model:              config.Model,
		BaseURL:            config.BaseURL,
		APIKeyConfigured:   config.APIKey != "",
		GuardrailEnabled:   config.GuardrailEnabled,
		GuardrailProvider:  config.GuardrailProvider,
		GuardrailModel:     config.GuardrailModel,
		GuardrailBaseURL:   config.GuardrailBaseURL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(safeConfig)
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

Data Access:
- You have tools to query the organization's database for real-time data
- When users ask about workflows, executions, tasks, teams, or activity — ALWAYS use your tools to get real data
- NEVER fabricate or make up data. If a tool returns no results, tell the user honestly
- You can list flows, view action flow executions, check human tasks, query audit logs, and view teams

Guidelines:
- Be concise but thorough
- Use bullet points for lists
- When explaining errors, suggest specific solutions
- Reference specific step names and data when available
- If you don't have enough context, ask for clarification
- When presenting data from tools, format it clearly with tables or bullet points`,
		timestamp, userName, userRole, orgName,
		func() string {
			if orgSlug == "enigmatic-i2v2i" {
				return "SUPER ADMIN (Access to ALL organizations and system data)"
			}
			return "STANDARD (Access restricted to current organization only)"
		}())

	if contextData != "" {
		// SECURITY: Sanitize and validate context data
		sanitizedContext := sanitizeContextData(contextData)
		if sanitizedContext != "" {
			prompt += "\n\n## Additional Data Context\n" + sanitizedContext
		}
	}

	return prompt
}

// sanitizeContextData validates and sanitizes context data to prevent prompt injection
func sanitizeContextData(contextData string) string {
	const MaxContextLength = 5000 // 5k characters max for context

	// 1. Length validation
	if len(contextData) > MaxContextLength {
		contextData = contextData[:MaxContextLength] + "... [truncated]"
	}

	// 2. Remove null bytes and control characters (keep newlines and tabs)
	contextData = sanitizeInput(contextData)

	// 3. Detect and block prompt injection attempts
	suspiciousPatterns := []string{
		"ignore previous instructions",
		"ignore all previous",
		"disregard previous",
		"forget previous",
		"system:",
		"</system>",
		"<|im_start|>",
		"<|im_end|>",
		"[INST]",
		"[/INST]",
		"### Instruction:",
		"### Response:",
	}

	lowerContext := strings.ToLower(contextData)
	for _, pattern := range suspiciousPatterns {
		if strings.Contains(lowerContext, pattern) {
			// Log the attempt but don't fail - just sanitize
			log.Printf("SECURITY: Potential prompt injection detected in context: %s", pattern)
			// Remove the suspicious pattern
			contextData = strings.ReplaceAll(contextData, pattern, "[REDACTED]")
			contextData = strings.ReplaceAll(contextData, strings.ToUpper(pattern), "[REDACTED]")
			contextData = strings.ReplaceAll(contextData, strings.Title(pattern), "[REDACTED]")
		}
	}

	// 4. Escape any markdown code blocks that could be used for injection
	// Replace triple backticks with escaped version
	contextData = strings.ReplaceAll(contextData, "```", "'''")

	return contextData
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
