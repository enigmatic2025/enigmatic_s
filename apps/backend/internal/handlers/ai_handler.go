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

// extractLatestUserMessage pulls the latest user message from the payload for validation/guardrail
func extractLatestUserMessage(payload *ChatPayload) string {
	if payload.Message != "" {
		return payload.Message
	}
	if len(payload.Messages) > 0 {
		for i := len(payload.Messages) - 1; i >= 0; i-- {
			if payload.Messages[i].Role == "user" {
				content := payload.Messages[i].Content
				if content == "" && len(payload.Messages[i].Parts) > 0 {
					for _, p := range payload.Messages[i].Parts {
						if p.Type == "text" {
							content += p.Text
						}
					}
				}
				return content
			}
		}
	}
	return ""
}

// buildLLMMessages constructs the message array for the LLM from system prompt + conversation history
func buildLLMMessages(systemPrompt string, payload ChatPayload) []services.Message {
	const maxHistoryMessages = 20 // Cap conversation history to control token usage

	messages := []services.Message{
		{Role: "system", Content: systemPrompt},
	}

	// If frontend sent conversation history, use it
	if len(payload.Messages) > 0 {
		history := payload.Messages
		if len(history) > maxHistoryMessages {
			history = history[len(history)-maxHistoryMessages:]
		}
		for _, msg := range history {
			if msg.Role != "user" && msg.Role != "assistant" {
				continue
			}
			content := msg.Content
			if content == "" && len(msg.Parts) > 0 {
				for _, p := range msg.Parts {
					if p.Type == "text" {
						content += p.Text
					}
				}
			}
			if content != "" {
				messages = append(messages, services.Message{
					Role:    msg.Role,
					Content: sanitizeInput(content),
				})
			}
		}
	} else if payload.Message != "" {
		// Legacy single message
		messages = append(messages, services.Message{
			Role:    "user",
			Content: payload.Message,
		})
	}

	return messages
}

// ChatHandler handles POST /api/ai/chat (non-streaming)
func (h *AIHandler) ChatHandler(w http.ResponseWriter, r *http.Request) {
	var payload ChatPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Extract latest user message for validation
	latestMessage := extractLatestUserMessage(&payload)
	if latestMessage == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	const MaxMessageLength = 10000
	if len(latestMessage) > MaxMessageLength {
		http.Error(w, fmt.Sprintf("Message too long (max %d characters)", MaxMessageLength), http.StatusBadRequest)
		return
	}

	latestMessage = sanitizeInput(latestMessage)
	payload.Message = latestMessage // Keep for backward compat

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

	logger := h.getRequestLogger(r, userID, orgID)
	logger.Info("AI chat request received")

	// 3. Pre-flight credit check (no deduction yet — post-deduction model)
	if err := h.aiService.HasMinimumCredits(orgID); err != nil {
		logger.WithError(err).Warn("Credit check failed")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "insufficient_credits",
			"message": "Your organization has run out of AI credits. Please contact your administrator.",
		})
		return
	}

	// 4. Run guardrail classification (on latest message only)
	allowed, reason, err := h.aiService.ClassifyPrompt(r.Context(), latestMessage)
	if err != nil {
		logger.WithError(err).Warn("Guardrail error (allowing through)")
	}

	if !allowed {
		h.aiService.LogUsage(userID, orgID, "guardrail", "blocked", 0, 0, 0, 0)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "guardrail_blocked",
			"message": reason,
		})
		return
	}

	// 5. Fetch context details
	userName, userRole, _ := h.aiService.GetUserProfile(userID)
	orgName, orgSlug, _ := h.aiService.GetOrgDetails(orgID)

	// 6. Build system prompt and LLM messages (with conversation history)
	systemPrompt := buildSystemPrompt(userName, userRole, orgName, orgSlug, payload.Context)
	llmMessages := buildLLMMessages(systemPrompt, payload)

	// 7. Build tool context
	toolCtx := services.ToolContext{
		OrgID:        orgID,
		OrgSlug:      orgSlug,
		IsSuperAdmin: orgSlug == "enigmatic-i2v2i",
		Client:       h.aiService.GetClient(),
		Logger:       h.logger,
	}
	tools := services.GetToolDefinitions()

	// 8. Generate response with tool-calling loop
	response, summary, err := h.aiService.GenerateWithToolLoop(r.Context(), llmMessages, tools, toolCtx)
	if err != nil {
		logger.WithError(err).Error("AI generation failed")
		http.Error(w, "AI Service Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 9. Post-deduction: calculate weighted credits from actual token usage
	creditsCharged := 1
	if summary != nil {
		creditsCharged = services.CalculateWeightedCredits(*summary)
	}
	if err := h.aiService.CheckAndDeductCredits(orgID, creditsCharged); err != nil {
		logger.WithError(err).Warn("Post-deduction failed (response already generated)")
		// Don't fail the request — user already got the response. Log it.
	}

	// 10. Log usage with per-model breakdown
	if summary != nil {
		h.aiService.LogWeightedUsage(userID, orgID, "allowed", *summary, creditsCharged)
	}

	totalPrompt := 0
	totalCompletion := 0
	if summary != nil {
		totalPrompt = summary.PrimaryPromptTokens + summary.ReasoningPromptTokens
		totalCompletion = summary.PrimaryCompletionTokens + summary.ReasoningCompletionTokens
	}

	logger.WithFields(logrus.Fields{
		"models_used":     summary.ModelsUsed,
		"total_prompt":    totalPrompt,
		"total_completion": totalCompletion,
		"credits_charged": creditsCharged,
	}).Info("AI chat request completed successfully")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"response": response,
		"usage": map[string]int{
			"prompt_tokens":     totalPrompt,
			"completion_tokens": totalCompletion,
			"total_tokens":      totalPrompt + totalCompletion,
			"credits_charged":   creditsCharged,
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

	// Extract latest user message for validation
	latestMessage := extractLatestUserMessage(&payload)
	if latestMessage == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	const MaxMessageLength = 10000
	if len(latestMessage) > MaxMessageLength {
		http.Error(w, fmt.Sprintf("Message too long (max %d characters)", MaxMessageLength), http.StatusBadRequest)
		return
	}

	latestMessage = sanitizeInput(latestMessage)
	payload.Message = latestMessage

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

	// 3. Pre-flight credit check (no deduction — post-deduction model)
	if err := h.aiService.HasMinimumCredits(orgID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "insufficient_credits",
			"message": "Your organization has run out of AI credits.",
		})
		return
	}

	// 4. Guardrail (on latest message only)
	allowed, reason, _ := h.aiService.ClassifyPrompt(r.Context(), latestMessage)
	if !allowed {
		h.aiService.LogUsage(userID, orgID, "guardrail", "blocked", 0, 0, 0, 0)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   "guardrail_blocked",
			"message": reason,
		})
		return
	}

	// 5. Fetch context details
	userName, userRole, _ := h.aiService.GetUserProfile(userID)
	orgName, orgSlug, _ := h.aiService.GetOrgDetails(orgID)

	// 6. Build system prompt and LLM messages (with conversation history)
	systemPrompt := buildSystemPrompt(userName, userRole, orgName, orgSlug, payload.Context)
	llmMessages := buildLLMMessages(systemPrompt, payload)

	// 7. Build tool context
	toolCtx := services.ToolContext{
		OrgID:        orgID,
		OrgSlug:      orgSlug,
		IsSuperAdmin: orgSlug == "enigmatic-i2v2i",
		Client:       h.aiService.GetClient(),
		Logger:       h.logger,
	}
	tools := services.GetToolDefinitions()

	// 8. Stream response with tool-calling loop
	summary, err := h.aiService.GenerateStreamingWithToolLoop(r.Context(), w, llmMessages, tools, toolCtx)
	if err != nil {
		log.Printf("AI Stream: generation error: %v", err)
		http.Error(w, "AI Service Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 9. Post-deduction: calculate weighted credits from actual token usage
	creditsCharged := 1
	if summary != nil {
		creditsCharged = services.CalculateWeightedCredits(*summary)
	}
	if err := h.aiService.CheckAndDeductCredits(orgID, creditsCharged); err != nil {
		log.Printf("AI Stream: post-deduction failed (response already streamed): %v", err)
	}

	// 10. Log usage with per-model breakdown
	if summary != nil {
		h.aiService.LogWeightedUsage(userID, orgID, "allowed", *summary, creditsCharged)
	}
}

// GetConfigHandler handles GET /api/admin/ai-config
// SECURITY: Never returns API keys - only config status
func (h *AIHandler) GetConfigHandler(w http.ResponseWriter, r *http.Request) {
	config := h.aiService.GetConfig()

	safeConfig := struct {
		Provider         string `json:"provider"`
		Model            string `json:"model"`
		BaseURL          string `json:"base_url"`
		APIKeyConfigured bool   `json:"api_key_configured"`
		ReasoningModel   string `json:"reasoning_model"`
		GuardrailEnabled bool   `json:"guardrail_enabled"`
		GuardrailModel   string `json:"guardrail_model"`
	}{
		Provider:         config.Provider,
		Model:            config.Model,
		BaseURL:          config.BaseURL,
		APIKeyConfigured: config.APIKey != "",
		ReasoningModel:   config.ReasoningModel,
		GuardrailEnabled: config.GuardrailEnabled,
		GuardrailModel: config.GuardrailModel,
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
- When users ask about workflows, executions, tasks, teams, activity, or comments — ALWAYS use your tools first
- NEVER fabricate or make up data. If a tool returns no results, say so honestly
- Available tools: list_flows, get_flow_details, list_action_flows, get_action_flow_details, list_human_tasks, query_audit_logs, list_teams_and_members, list_comments

Visualization:
- When the user asks for a process flow, diagram, or visualization, use Mermaid syntax in a mermaid code block
- For workflow visualizations, use flowchart (graph TD/LR) showing steps and decision points
- For timelines, use Mermaid gantt charts
- For status overviews, use Mermaid pie charts
- For step sequences, use Mermaid sequence diagrams
- Example: to show a process flow, output a fenced code block with language "mermaid"
- Keep diagrams clean — 3-10 nodes is ideal, summarize if more

Guidelines:
- Be concise but thorough
- Use bullet points for lists, markdown tables for structured data
- When explaining errors, suggest specific solutions
- Reference specific step names and data when available
- If you don't have enough context, ask for clarification
- Format numbers with commas and dates in readable format
- You maintain conversation context — reference previous messages when relevant`,
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
