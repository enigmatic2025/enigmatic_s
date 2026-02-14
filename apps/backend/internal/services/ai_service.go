package services

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/nedpals/supabase-go"
	"github.com/sirupsen/logrus"
	"github.com/teavana/enigmatic_s/apps/backend/internal/metrics"
)

// AIConfig holds the dynamic configuration loaded from system_settings
type AIConfig struct {
	// Main model config
	Provider string `json:"provider"`
	BaseURL  string `json:"base_url"`
	Model    string `json:"model"`
	APIKey   string `json:"api_key"`

	// Guardrail config
	GuardrailEnabled  bool   `json:"guardrail_enabled"`
	GuardrailProvider string `json:"guardrail_provider"`
	GuardrailModel    string `json:"guardrail_model"`
	GuardrailBaseURL  string `json:"guardrail_base_url"`
}

// AIService handles interactions with AI providers
type AIService struct {
	client              *supabase.Client
	httpClient          *http.Client // For non-streaming requests (30s timeout)
	streamingHTTPClient *http.Client // For streaming requests (60s timeout)
	guardrailHTTPClient *http.Client // For guardrail checks (10s timeout)
	config              *AIConfig
	configMu            sync.RWMutex
	logger              *logrus.Logger
	circuitBreaker      *CircuitBreaker // Circuit breaker for AI API calls
}

func NewAIService(client *supabase.Client) *AIService {
	s := &AIService{
		client:              client,
		httpClient:          &http.Client{Timeout: 30 * time.Second},  // Non-streaming: 30s
		streamingHTTPClient: &http.Client{Timeout: 60 * time.Second},  // Streaming: 60s
		guardrailHTTPClient: &http.Client{Timeout: 10 * time.Second},  // Guardrail: 10s (fast check)
		logger:              logrus.New(),
		circuitBreaker:      NewCircuitBreaker(5, 30*time.Second), // Open after 5 failures, retry after 30s
	}
	// Initial load
	if err := s.LoadConfig(); err != nil {
		logrus.Warnf("Failed to load AI config on startup: %v", err)
	}
	return s
}

// LoadConfig fetches all AI settings from system_settings table
func (s *AIService) LoadConfig() error {
	var rows []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	err := s.client.DB.From("system_settings").Select("key, value").Execute(&rows)
	if err != nil {
		return err
	}

	newConfig := &AIConfig{
		Provider:          "openrouter",
		BaseURL:           "https://openrouter.ai/api/v1",
		Model:             "google/gemini-2.0-flash-001",
		GuardrailEnabled:  true,
		GuardrailProvider: "openrouter",
		GuardrailModel:    "google/gemini-2.0-flash-lite-001",
		GuardrailBaseURL:  "https://openrouter.ai/api/v1",
	}

	for _, row := range rows {
		switch row.Key {
		case "ai_provider":
			newConfig.Provider = row.Value
		case "ai_base_url":
			newConfig.BaseURL = row.Value
		case "ai_model":
			newConfig.Model = row.Value
		case "ai_api_key":
			newConfig.APIKey = row.Value
		case "ai_guardrail_enabled":
			newConfig.GuardrailEnabled = row.Value == "true"
		case "ai_guardrail_provider":
			newConfig.GuardrailProvider = row.Value
		case "ai_guardrail_model":
			newConfig.GuardrailModel = row.Value
		case "ai_guardrail_base_url":
			newConfig.GuardrailBaseURL = row.Value
		}
	}

	// Environment variable overrides/fallbacks
	if val, ok := os.LookupEnv("AI_PROVIDER"); ok && newConfig.Provider == "openrouter" {
		newConfig.Provider = val
	}
	if val, ok := os.LookupEnv("AI_BASE_URL"); ok {
		newConfig.BaseURL = val
	}
	if val, ok := os.LookupEnv("AI_MODEL"); ok {
		newConfig.Model = val
	}
	if val, ok := os.LookupEnv("AI_API_KEY"); ok && newConfig.APIKey == "" {
		newConfig.APIKey = val
	}

	s.configMu.Lock()
	s.config = newConfig
	s.configMu.Unlock()

	s.logger.Infof("AI Config Loaded: Provider=%s, Model=%s, Guardrail=%v", newConfig.Provider, newConfig.Model, newConfig.GuardrailEnabled)
	return nil
}

// GetConfig returns a copy of current config
func (s *AIService) GetConfig() AIConfig {
	s.configMu.RLock()
	defer s.configMu.RUnlock()
	if s.config == nil {
		return AIConfig{}
	}
	return *s.config
}

// GetClient returns the supabase client for direct queries
func (s *AIService) GetClient() *supabase.Client {
	return s.client
}

// ---- OpenAI-compatible types ----

type ChatRequest struct {
	Model      string    `json:"model"`
	Messages   []Message `json:"messages"`
	Stream     bool      `json:"stream,omitempty"`
	Tools      []Tool    `json:"tools,omitempty"`
	ToolChoice any       `json:"tool_choice,omitempty"`
}

type Message struct {
	Role       string     `json:"role"`
	Content    string     `json:"content"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"` // For tool response messages
}

type Tool struct {
	Type     string   `json:"type"`
	Function Function `json:"function"`
}

type Function struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Parameters  any    `json:"parameters"`
}

type ToolCall struct {
	ID       string       `json:"id"`
	Type     string       `json:"type"`
	Function FunctionCall `json:"function"`
}

type FunctionCall struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

type ChatResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
	Usage *UsageInfo `json:"usage,omitempty"`
}

type UsageInfo struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type StreamChunk struct {
	Choices []struct {
		Delta struct {
			Content   string     `json:"content"`
			ToolCalls []ToolCall `json:"tool_calls,omitempty"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
	Usage *UsageInfo `json:"usage,omitempty"`
}

// ---- Guardrail Classification ----

// ClassifyPrompt uses a cheap model to determine if a prompt is business-related
func (s *AIService) ClassifyPrompt(ctx context.Context, userMessage string) (allowed bool, reason string, err error) {
	config := s.GetConfig()

	if !config.GuardrailEnabled {
		return true, "", nil
	}

	if config.APIKey == "" {
		return true, "", nil // If no API key, skip guardrail
	}

	// First, check for PII (Personally Identifiable Information)
	if hasPII, piiType := detectPII(userMessage); hasPII {
		s.logger.Warnf("PII detected in prompt: %s", piiType)
		metrics.RecordPIIDetection(piiType) // Record metrics
		return false, fmt.Sprintf("Your message contains sensitive information (%s). Please remove it and try again.", piiType), nil
	}

	classificationPrompt := `You are a prompt classifier for a business automation platform called Enigmatic.
Your ONLY job is to determine if the user's message is related to:
- Business automation, workflows, or process management
- Data analysis, reporting, or business intelligence
- Technical questions about the platform, APIs, or integrations
- General business operations, productivity, or professional tasks
- Debugging errors, analyzing logs, or troubleshooting
- Greetings, polite small talk, or asking for help/capabilities

Respond with EXACTLY one word:
- "ALLOWED" if the message is business/platform related or a benign greeting
- "BLOCKED" if the message is clearly personal, inappropriate, or completely unrelated to business (e.g., writing poems, personal advice, games, etc.)

Be lenient — if there is ANY reasonable business interpretation OR if it is a greeting, respond ALLOWED.`

	// Use guardrail-specific config (cheap/fast model)
	baseURL := config.GuardrailBaseURL
	if baseURL == "" {
		baseURL = config.BaseURL
	}
	model := config.GuardrailModel
	if model == "" {
		model = config.Model
	}

	reqBody := ChatRequest{
		Model: model,
		Messages: []Message{
			{Role: "system", Content: classificationPrompt},
			{Role: "user", Content: userMessage},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return true, "", err // Fail open
	}

	url := fmt.Sprintf("%s/chat/completions", baseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return true, "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))
	if config.GuardrailProvider == "openrouter" || config.Provider == "openrouter" {
		req.Header.Set("HTTP-Referer", "https://enigmatic.works")
		req.Header.Set("X-Title", "Enigmatic Guardrail")
	}

	// Use guardrail HTTP client with 10s timeout
	resp, err := s.guardrailHTTPClient.Do(req)
	if err != nil {
		s.logger.Warnf("Guardrail request failed, allowing through: %v", err)
		return true, "", nil // Fail open
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.logger.Warnf("Guardrail returned status %d, allowing through", resp.StatusCode)
		return true, "", nil // Fail open
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return true, "", nil // Fail open
	}

	if len(chatResp.Choices) == 0 {
		return true, "", nil
	}

	result := strings.TrimSpace(strings.ToUpper(chatResp.Choices[0].Message.Content))
	if strings.Contains(result, "BLOCKED") {
		return false, "This question doesn't appear to be related to business automation or the Enigmatic platform. Please ask something related to your workflows, data, or platform features.", nil
	}

	return true, "", nil
}

// ---- Credit System ----

// CheckAndDeductCredits atomically checks and deducts credits from an org
// Uses optimistic locking with retry to prevent race conditions
func (s *AIService) CheckAndDeductCredits(orgID string, cost int) error {
	const maxRetries = 3

	for attempt := 0; attempt < maxRetries; attempt++ {
		// 1. Get current balance with version
		var orgs []struct {
			AICreditsBalance  int       `json:"ai_credits_balance"`
			AIUnlimitedAccess *bool     `json:"ai_unlimited_access"`
			UpdatedAt         time.Time `json:"updated_at"`
		}

		err := s.client.DB.From("organizations").
			Select("ai_credits_balance, ai_unlimited_access, updated_at").
			Eq("id", orgID).
			Execute(&orgs)

		if err != nil {
			return fmt.Errorf("failed to check credits: %w", err)
		}

		if len(orgs) == 0 {
			return fmt.Errorf("organization not found")
		}

		// Skip credit check if org has unlimited access
		if orgs[0].AIUnlimitedAccess != nil && *orgs[0].AIUnlimitedAccess {
			return nil
		}

		currentBalance := orgs[0].AICreditsBalance
		lastUpdated := orgs[0].UpdatedAt

		// 2. Check if sufficient balance
		if currentBalance < cost {
			return fmt.Errorf("insufficient AI credits (balance: %d, cost: %d)", currentBalance, cost)
		}

		// 3. Try to update with optimistic locking
		newBalance := currentBalance - cost
		var result []map[string]interface{}

		// Update only if updated_at hasn't changed (optimistic lock)
		err = s.client.DB.From("organizations").
			Update(map[string]interface{}{
				"ai_credits_balance": newBalance,
				"updated_at":         time.Now(),
			}).
			Eq("id", orgID).
			Eq("updated_at", lastUpdated.Format(time.RFC3339Nano)).
			Execute(&result)

		if err != nil {
			return fmt.Errorf("failed to deduct credits: %w", err)
		}

		// 4. Check if update was successful (row was actually updated)
		if len(result) > 0 {
			// Success! The row was updated
			return nil
		}

		// Update failed - another request modified the row
		// Retry with exponential backoff
		if attempt < maxRetries-1 {
			time.Sleep(time.Duration(10*(attempt+1)) * time.Millisecond)
			s.logger.Debugf("Credit deduction retry %d for org %s", attempt+1, orgID)
			continue
		}
	}

	return fmt.Errorf("failed to deduct credits after %d retries (concurrent modification)", maxRetries)
}

// GetUserOrgID looks up the user's primary organization
func (s *AIService) GetUserOrgID(userID string) (string, error) {
	var memberships []struct {
		OrgID string `json:"org_id"`
	}

	err := s.client.DB.From("memberships").Select("org_id").Eq("user_id", userID).Execute(&memberships)
	if err != nil {
		return "", err
	}

	if len(memberships) == 0 {
		return "", fmt.Errorf("user has no organization membership")
	}

	return memberships[0].OrgID, nil
}

// ---- Usage Logging ----

// GetOrgDetails returns organization details
func (s *AIService) GetOrgDetails(orgID string) (string, string, error) {
	var orgs []struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	}
	err := s.client.DB.From("organizations").Select("name, slug").Eq("id", orgID).Execute(&orgs)
	if err != nil {
		return "", "", err
	}
	if len(orgs) == 0 {
		return "", "", fmt.Errorf("organization not found")
	}
	return orgs[0].Name, orgs[0].Slug, nil
}

// GetUserProfile returns user details
func (s *AIService) GetUserProfile(userID string) (string, string, error) {
	var profiles []struct {
		FullName   string `json:"full_name"`
		SystemRole string `json:"system_role"`
	}
	err := s.client.DB.From("profiles").Select("full_name, system_role").Eq("id", userID).Execute(&profiles)
	if err != nil {
		return "", "", err
	}
	if len(profiles) == 0 {
		return "Unknown User", "user", nil
	}
	return profiles[0].FullName, profiles[0].SystemRole, nil
}

// ---- Usage Logging ----

// LogUsage writes a record to ai_usage_log
func (s *AIService) LogUsage(userID, orgID, model, guardrailResult string, promptTokens, completionTokens, totalTokens, creditsCharged int) {
	row := map[string]interface{}{
		"user_id":           userID,
		"org_id":            orgID,
		"model":             model,
		"guardrail_result":  guardrailResult,
		"prompt_tokens":     promptTokens,
		"completion_tokens": completionTokens,
		"total_tokens":      totalTokens,
		"credits_charged":   creditsCharged,
	}

	var result []interface{}
	err := s.client.DB.From("ai_usage_log").Insert(row).Execute(&result)
	if err != nil {
		s.logger.Errorf("Failed to log AI usage: %v", err)
	}
}

// ---- Core Generation ----

// GenerateResponse sends a prompt to the configured AI (non-streaming)
func (s *AIService) GenerateResponse(ctx context.Context, systemPrompt, userMessage string) (string, *UsageInfo, error) {
	config := s.GetConfig()

	if config.APIKey == "" {
		return "", nil, fmt.Errorf("AI API Key is not configured")
	}

	reqBody := ChatRequest{
		Model: config.Model,
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userMessage},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", nil, err
	}

	url := fmt.Sprintf("%s/chat/completions", config.BaseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))

	if config.Provider == "openrouter" {
		req.Header.Set("HTTP-Referer", "https://enigmatic.works")
		req.Header.Set("X-Title", "Enigmatic Flow Studio")
	}

	// Use retry logic (3 attempts for transient failures)
	resp, err := s.retryableHTTPDo(s.httpClient, req, 2) // 2 retries = 3 total attempts
	if err != nil {
		return "", nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", nil, fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", nil, err
	}

	if len(chatResp.Choices) == 0 {
		return "", nil, fmt.Errorf("empty response from AI")
	}

	return chatResp.Choices[0].Message.Content, chatResp.Usage, nil
}

// GenerateStreamingResponse sends a prompt and streams SSE chunks to the writer
func (s *AIService) GenerateStreamingResponse(ctx context.Context, w http.ResponseWriter, systemPrompt, userMessage string) (*UsageInfo, error) {
	config := s.GetConfig()

	if config.APIKey == "" {
		return nil, fmt.Errorf("AI API Key is not configured")
	}

	reqBody := ChatRequest{
		Model:  config.Model,
		Stream: true,
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userMessage},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/chat/completions", config.BaseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))

	if config.Provider == "openrouter" {
		req.Header.Set("HTTP-Referer", "https://enigmatic.works")
		req.Header.Set("X-Title", "Enigmatic Flow Studio")
	}

	// Use retry logic for initial connection (streaming can't retry mid-stream)
	// Only retry the connection establishment, not the streaming itself
	resp, err := s.retryableHTTPDo(s.streamingHTTPClient, req, 2) // 2 retries = 3 total attempts
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
	}

	// Set headers for Vercel AI SDK Data Stream Protocol v1
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Vercel-AI-Data-Stream", "v1")

	flusher, ok := w.(http.Flusher)
	if !ok {
		return nil, fmt.Errorf("streaming not supported")
	}

	scanner := bufio.NewScanner(resp.Body)
	var usage *UsageInfo
	var finishReason string = "stop"

	for scanner.Scan() {
		line := scanner.Text()

		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")

		if data == "[DONE]" {
			break
		}

		// Parse chunk to extract content and usage
		var chunk StreamChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		// Capture usage info from the last chunk
		if chunk.Usage != nil {
			usage = chunk.Usage
		}

		// Extract content and finish reason
		var content string
		if len(chunk.Choices) > 0 {
			content = chunk.Choices[0].Delta.Content
			if chunk.Choices[0].FinishReason != nil && *chunk.Choices[0].FinishReason != "" {
				finishReason = *chunk.Choices[0].FinishReason
			}
		}

		// Format as Data Stream Protocol text part (0)
		if content != "" {
			// Send text chunk: 0:"text_content"\n
			jsonContent, _ := json.Marshal(content)
			fmt.Fprintf(w, "0:%s\n", jsonContent)
			flusher.Flush()
		}
	}

	// Send finish message with metadata
	finishData := map[string]interface{}{
		"finishReason": finishReason,
	}

	// Add usage info if available
	if usage != nil {
		finishData["usage"] = map[string]interface{}{
			"promptTokens":     usage.PromptTokens,
			"completionTokens": usage.CompletionTokens,
		}
	}

	// Send finish message: d:{metadata}\n
	finishJSON, _ := json.Marshal(finishData)
	fmt.Fprintf(w, "d:%s\n", finishJSON)
	flusher.Flush()

	return usage, nil
}

// ---- Tool-Calling Agent Loop ----

// GenerateWithToolLoop sends a prompt with tools and resolves tool calls in a loop (non-streaming)
func (s *AIService) GenerateWithToolLoop(ctx context.Context, systemPrompt, userMessage string, tools []Tool, toolCtx ToolContext) (string, *UsageInfo, error) {
	config := s.GetConfig()
	if config.APIKey == "" {
		return "", nil, fmt.Errorf("AI API Key is not configured")
	}

	messages := []Message{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userMessage},
	}

	const maxIterations = 5
	var totalUsage UsageInfo

	for i := 0; i < maxIterations; i++ {
		reqBody := ChatRequest{
			Model:      config.Model,
			Messages:   messages,
			Tools:      tools,
			ToolChoice: "auto",
		}

		jsonBody, err := json.Marshal(reqBody)
		if err != nil {
			return "", nil, err
		}

		url := fmt.Sprintf("%s/chat/completions", config.BaseURL)
		req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
		if err != nil {
			return "", nil, err
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))
		if config.Provider == "openrouter" {
			req.Header.Set("HTTP-Referer", "https://enigmatic.works")
			req.Header.Set("X-Title", "Enigmatic Flow Studio")
		}

		resp, err := s.retryableHTTPDo(s.httpClient, req, 2)
		if err != nil {
			return "", nil, err
		}

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return "", nil, fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
		}

		var chatResp ChatResponse
		json.NewDecoder(resp.Body).Decode(&chatResp)
		resp.Body.Close()

		if chatResp.Usage != nil {
			totalUsage.PromptTokens += chatResp.Usage.PromptTokens
			totalUsage.CompletionTokens += chatResp.Usage.CompletionTokens
			totalUsage.TotalTokens += chatResp.Usage.TotalTokens
		}

		if len(chatResp.Choices) == 0 {
			return "", &totalUsage, fmt.Errorf("empty response from AI")
		}

		assistantMsg := chatResp.Choices[0].Message

		// If no tool calls, return the text content
		if len(assistantMsg.ToolCalls) == 0 {
			return assistantMsg.Content, &totalUsage, nil
		}

		// Append assistant message (with tool calls) to history
		messages = append(messages, assistantMsg)

		// Execute each tool call and append results
		for _, tc := range assistantMsg.ToolCalls {
			result, err := ExecuteTool(toolCtx, tc)
			if err != nil {
				result = fmt.Sprintf(`{"error": "%s"}`, err.Error())
			}
			messages = append(messages, Message{
				Role:       "tool",
				Content:    result,
				ToolCallID: tc.ID,
			})
		}
	}

	return "I was unable to complete the lookup. Please try a more specific question.", &totalUsage, nil
}

// GenerateStreamingWithToolLoop resolves tool calls non-streaming, then streams the final answer
func (s *AIService) GenerateStreamingWithToolLoop(ctx context.Context, w http.ResponseWriter, systemPrompt, userMessage string, tools []Tool, toolCtx ToolContext) (*UsageInfo, error) {
	config := s.GetConfig()
	if config.APIKey == "" {
		return nil, fmt.Errorf("AI API Key is not configured")
	}

	messages := []Message{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userMessage},
	}

	const maxIterations = 5
	var totalUsage UsageInfo

	// Phase 1: Non-streaming tool-calling loop
	for i := 0; i < maxIterations; i++ {
		reqBody := ChatRequest{
			Model:      config.Model,
			Messages:   messages,
			Tools:      tools,
			ToolChoice: "auto",
		}

		jsonBody, err := json.Marshal(reqBody)
		if err != nil {
			return nil, err
		}

		url := fmt.Sprintf("%s/chat/completions", config.BaseURL)
		req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
		if err != nil {
			return nil, err
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))
		if config.Provider == "openrouter" {
			req.Header.Set("HTTP-Referer", "https://enigmatic.works")
			req.Header.Set("X-Title", "Enigmatic Flow Studio")
		}

		resp, err := s.retryableHTTPDo(s.httpClient, req, 2)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return nil, fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
		}

		var chatResp ChatResponse
		json.NewDecoder(resp.Body).Decode(&chatResp)
		resp.Body.Close()

		if chatResp.Usage != nil {
			totalUsage.PromptTokens += chatResp.Usage.PromptTokens
			totalUsage.CompletionTokens += chatResp.Usage.CompletionTokens
			totalUsage.TotalTokens += chatResp.Usage.TotalTokens
		}

		if len(chatResp.Choices) == 0 {
			return &totalUsage, fmt.Errorf("empty response from AI")
		}

		assistantMsg := chatResp.Choices[0].Message

		// No tool calls — proceed to streaming phase
		if len(assistantMsg.ToolCalls) == 0 {
			// LLM produced a final answer without needing tools (e.g. greeting)
			// Stream it using the existing protocol
			return s.streamPrecomputedResponse(w, assistantMsg.Content, &totalUsage)
		}

		// Append assistant + tool results
		messages = append(messages, assistantMsg)
		for _, tc := range assistantMsg.ToolCalls {
			result, err := ExecuteTool(toolCtx, tc)
			if err != nil {
				result = fmt.Sprintf(`{"error": "%s"}`, err.Error())
			}
			messages = append(messages, Message{
				Role:       "tool",
				Content:    result,
				ToolCallID: tc.ID,
			})
		}

		s.logger.Debugf("Tool loop iteration %d: %d tool calls resolved", i+1, len(assistantMsg.ToolCalls))
	}

	// Phase 2: Stream the final answer
	// Re-send the full conversation (with tool results) in streaming mode, no tools
	return s.streamFinalResponse(ctx, w, config, messages, &totalUsage)
}

// streamFinalResponse makes a streaming LLM call with the full conversation history (no tools)
func (s *AIService) streamFinalResponse(ctx context.Context, w http.ResponseWriter, config AIConfig, messages []Message, totalUsage *UsageInfo) (*UsageInfo, error) {
	reqBody := ChatRequest{
		Model:    config.Model,
		Messages: messages,
		Stream:   true,
		// No tools — force text response
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/chat/completions", config.BaseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))
	if config.Provider == "openrouter" {
		req.Header.Set("HTTP-Referer", "https://enigmatic.works")
		req.Header.Set("X-Title", "Enigmatic Flow Studio")
	}

	resp, err := s.retryableHTTPDo(s.streamingHTTPClient, req, 2)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
	}

	// Stream using existing Vercel AI Data Stream Protocol v1
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Vercel-AI-Data-Stream", "v1")

	flusher, ok := w.(http.Flusher)
	if !ok {
		return nil, fmt.Errorf("streaming not supported")
	}

	scanner := bufio.NewScanner(resp.Body)
	var streamUsage *UsageInfo
	finishReason := "stop"

	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var chunk StreamChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		if chunk.Usage != nil {
			streamUsage = chunk.Usage
		}

		var content string
		if len(chunk.Choices) > 0 {
			content = chunk.Choices[0].Delta.Content
			if chunk.Choices[0].FinishReason != nil && *chunk.Choices[0].FinishReason != "" {
				finishReason = *chunk.Choices[0].FinishReason
			}
		}

		if content != "" {
			jsonContent, _ := json.Marshal(content)
			fmt.Fprintf(w, "0:%s\n", jsonContent)
			flusher.Flush()
		}
	}

	// Merge stream usage into total
	if streamUsage != nil {
		totalUsage.PromptTokens += streamUsage.PromptTokens
		totalUsage.CompletionTokens += streamUsage.CompletionTokens
		totalUsage.TotalTokens += streamUsage.TotalTokens
	}

	// Send finish message
	finishData := map[string]interface{}{
		"finishReason": finishReason,
	}
	if totalUsage != nil {
		finishData["usage"] = map[string]interface{}{
			"promptTokens":     totalUsage.PromptTokens,
			"completionTokens": totalUsage.CompletionTokens,
		}
	}
	finishJSON, _ := json.Marshal(finishData)
	fmt.Fprintf(w, "d:%s\n", finishJSON)
	flusher.Flush()

	return totalUsage, nil
}

// streamPrecomputedResponse sends a pre-computed text response using the streaming protocol
func (s *AIService) streamPrecomputedResponse(w http.ResponseWriter, content string, usage *UsageInfo) (*UsageInfo, error) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Vercel-AI-Data-Stream", "v1")

	flusher, ok := w.(http.Flusher)
	if !ok {
		return nil, fmt.Errorf("streaming not supported")
	}

	jsonContent, _ := json.Marshal(content)
	fmt.Fprintf(w, "0:%s\n", jsonContent)
	flusher.Flush()

	finishData := map[string]interface{}{
		"finishReason": "stop",
	}
	if usage != nil {
		finishData["usage"] = map[string]interface{}{
			"promptTokens":     usage.PromptTokens,
			"completionTokens": usage.CompletionTokens,
		}
	}
	finishJSON, _ := json.Marshal(finishData)
	fmt.Fprintf(w, "d:%s\n", finishJSON)
	flusher.Flush()

	return usage, nil
}

// ---- Config Management ----

// UpdateConfig updates a specific setting in the DB and reloads
func (s *AIService) UpdateConfig(key, value string) error {
	row := map[string]interface{}{
		"key":   key,
		"value": value,
	}
	var result []interface{}
	err := s.client.DB.From("system_settings").Upsert(row).Execute(&result)
	if err != nil {
		return err
	}

	return s.LoadConfig()
}

// ---- HTTP Retry Logic ----

// retryableHTTPDo executes an HTTP request with exponential backoff retry logic
// Retries on 429 (rate limit) and 5xx (server errors)
func (s *AIService) retryableHTTPDo(client *http.Client, req *http.Request, maxRetries int) (*http.Response, error) {
	var resp *http.Response
	var err error

	for attempt := 0; attempt <= maxRetries; attempt++ {
		// Clone the request body for retries (since body can only be read once)
		var bodyBytes []byte
		if req.Body != nil {
			bodyBytes, err = io.ReadAll(req.Body)
			if err != nil {
				return nil, fmt.Errorf("failed to read request body: %w", err)
			}
			req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// Attempt the request
		resp, err = client.Do(req)

		// If no error and status is OK, return immediately
		if err == nil && resp.StatusCode < 500 && resp.StatusCode != http.StatusTooManyRequests {
			return resp, nil
		}

		// Log the retry
		if err != nil {
			s.logger.Warnf("HTTP request failed (attempt %d/%d): %v", attempt+1, maxRetries+1, err)
			metrics.RecordRetry("network_error")
		} else {
			s.logger.Warnf("HTTP request returned %d (attempt %d/%d)", resp.StatusCode, attempt+1, maxRetries+1)
			if resp.StatusCode == http.StatusTooManyRequests {
				metrics.RecordRetry("rate_limit_429")
			} else {
				metrics.RecordRetry("server_error_5xx")
			}
			if resp != nil {
				resp.Body.Close() // Close before retry
			}
		}

		// If this was the last attempt, return the error
		if attempt == maxRetries {
			if err != nil {
				return nil, fmt.Errorf("request failed after %d retries: %w", maxRetries+1, err)
			}
			// Re-execute one final time to get the response for the caller
			if req.Body != nil && len(bodyBytes) > 0 {
				req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
			}
			return client.Do(req)
		}

		// Calculate exponential backoff: 100ms * 2^attempt (100ms, 200ms, 400ms, 800ms)
		backoff := time.Duration(100*(1<<uint(attempt))) * time.Millisecond

		// Add jitter to prevent thundering herd (random 0-50% of backoff)
		jitter := time.Duration(float64(backoff) * (0.5 * (float64(attempt%10) / 10.0)))
		sleepDuration := backoff + jitter

		s.logger.Debugf("Retrying in %v...", sleepDuration)
		time.Sleep(sleepDuration)

		// Reset request body for next attempt
		if req.Body != nil && len(bodyBytes) > 0 {
			req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}
	}

	return resp, err
}

// ---- PII Detection ----

var (
	// Credit card pattern (basic Luhn algorithm check would be better)
	creditCardPattern = regexp.MustCompile(`\b(?:\d[ -]*?){13,16}\b`)

	// SSN pattern (US)
	ssnPattern = regexp.MustCompile(`\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b`)

	// Email pattern
	emailPattern = regexp.MustCompile(`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`)

	// Phone number pattern (US/International)
	phonePattern = regexp.MustCompile(`\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b`)

	// API key patterns (common formats)
	apiKeyPattern = regexp.MustCompile(`\b(?:api[_-]?key|apikey|access[_-]?token|secret[_-]?key|auth[_-]?token)[:\s=]+['\"]?([a-zA-Z0-9_\-]{20,})['\"]?\b`)

	// Password patterns
	passwordPattern = regexp.MustCompile(`\b(?:password|passwd|pwd)[:\s=]+['\"]?([^\s'"]{6,})['\"]?\b`)
)

// detectPII checks if the message contains Personally Identifiable Information
// Returns true if PII is detected, along with the type of PII
func detectPII(message string) (bool, string) {
	// Check for credit card numbers
	if creditCardPattern.MatchString(message) {
		return true, "credit card number"
	}

	// Check for SSN
	if ssnPattern.MatchString(message) {
		return true, "social security number"
	}

	// Check for email addresses (be lenient, emails in business context are OK)
	// Only flag if there are multiple emails or it looks like a list
	emails := emailPattern.FindAllString(message, -1)
	if len(emails) > 3 {
		return true, "multiple email addresses"
	}

	// Check for phone numbers (be lenient, single phone in business context is OK)
	phones := phonePattern.FindAllString(message, -1)
	if len(phones) > 2 {
		return true, "multiple phone numbers"
	}

	// Check for API keys or tokens
	if apiKeyPattern.MatchString(message) {
		return true, "API key or access token"
	}

	// Check for passwords
	if passwordPattern.MatchString(message) {
		return true, "password"
	}

	return false, ""
}
