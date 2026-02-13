package services

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/nedpals/supabase-go"
	"github.com/sirupsen/logrus"
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
	client     *supabase.Client
	httpClient *http.Client
	config     *AIConfig
	configMu   sync.RWMutex
	logger     *logrus.Logger
}

func NewAIService(client *supabase.Client) *AIService {
	s := &AIService{
		client:     client,
		httpClient: &http.Client{Timeout: 90 * time.Second},
		logger:     logrus.New(),
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
		req.Header.Set("HTTP-Referer", "https://enigmatic.app")
		req.Header.Set("X-Title", "Enigmatic Guardrail")
	}

	// Use a short timeout for classification
	classifyClient := &http.Client{Timeout: 10 * time.Second}
	resp, err := classifyClient.Do(req)
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
func (s *AIService) CheckAndDeductCredits(orgID string, cost int) error {
	// First check balance
	var orgs []struct {
		AICreditsBalance int `json:"ai_credits_balance"`
	}

	err := s.client.DB.From("organizations").Select("ai_credits_balance").Eq("id", orgID).Execute(&orgs)
	if err != nil {
		return fmt.Errorf("failed to check credits: %w", err)
	}

	if len(orgs) == 0 {
		return fmt.Errorf("organization not found")
	}

	if orgs[0].AICreditsBalance < cost {
		return fmt.Errorf("insufficient AI credits (balance: %d, cost: %d)", orgs[0].AICreditsBalance, cost)
	}

	// Deduct credits
	newBalance := orgs[0].AICreditsBalance - cost
	var result []map[string]interface{}
	err = s.client.DB.From("organizations").Update(map[string]interface{}{
		"ai_credits_balance": newBalance,
	}).Eq("id", orgID).Execute(&result)

	if err != nil {
		return fmt.Errorf("failed to deduct credits: %w", err)
	}

	return nil
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
		req.Header.Set("HTTP-Referer", "https://enigmatic.app")
		req.Header.Set("X-Title", "Enigmatic Flow Studio")
	}

	resp, err := s.httpClient.Do(req)
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
		req.Header.Set("HTTP-Referer", "https://enigmatic.app")
		req.Header.Set("X-Title", "Enigmatic Flow Studio")
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	// Header for Vercel AI SDK Data Stream Protocol
	w.Header().Set("X-Vercel-AI-Data-Stream", "v1")

	flusher, ok := w.(http.Flusher)
	if !ok {
		return nil, fmt.Errorf("streaming not supported")
	}

	scanner := bufio.NewScanner(resp.Body)
	var usage *UsageInfo

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

		// Extract content
		var content string
		if len(chunk.Choices) > 0 {
			content = chunk.Choices[0].Delta.Content
		}

		// Format as Data Stream Protocol text part (0)
		if content != "" {
			// 0: "text_content_json_encoded"\n
			jsonContent, _ := json.Marshal(content)
			fmt.Fprintf(w, "0:%s\n", jsonContent)
			flusher.Flush()
		}
	}

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
