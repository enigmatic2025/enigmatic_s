package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/nedpals/supabase-go"
	"github.com/sirupsen/logrus"
)

// AIConfig holds the dynamic configuration
type AIConfig struct {
	Provider string
	BaseURL  string
	Model    string
	APIKey   string
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
		httpClient: &http.Client{Timeout: 60 * time.Second},
		logger:     logrus.New(),
	}
	// Initial load
	if err := s.LoadConfig(); err != nil {
		logrus.Warnf("Failed to load AI config on startup: %v", err)
	}
	return s
}

// LoadConfig fetches settings from the database
func (s *AIService) LoadConfig() error {
	var rows []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	// Fetch all system settings related to AI (or all settings if filter fails)
	// Using Like filter if supported, otherwise filter in memory
	err := s.client.DB.From("system_settings").Select("key, value").Execute(&rows)
	if err != nil {
		return err
	}

	newConfig := &AIConfig{
		Provider: "openrouter", // default
		BaseURL:  "https://openrouter.ai/api/v1",
		Model:    "google/gemini-2.0-flash-001",
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
		}
	}

	s.configMu.Lock()
	s.config = newConfig
	s.configMu.Unlock()

	s.logger.Infof("AI Config Loaded: Provider=%s, Model=%s", newConfig.Provider, newConfig.Model)
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

// ChatRequest is the standard OpenAI format
type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

// GenerateResponse sends a prompt to the configured AI
func (s *AIService) GenerateResponse(ctx context.Context, systemPrompt, userMessage string) (string, error) {
	config := s.GetConfig()

	if config.APIKey == "" {
		return "", fmt.Errorf("AI API Key is not configured")
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
		return "", err
	}

	url := fmt.Sprintf("%s/chat/completions", config.BaseURL)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", config.APIKey))

	// OpenRouter specific headers
	if config.Provider == "openrouter" {
		req.Header.Set("HTTP-Referer", "https://enigmatic.app")
		req.Header.Set("X-Title", "Enigmatic Flow Studio")
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("AI Provider Error (%d): %s", resp.StatusCode, string(body))
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", err
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("empty response from AI")
	}

	return chatResp.Choices[0].Message.Content, nil
}

// UpdateConfig updates a specific setting in the DB and reloads
func (s *AIService) UpdateConfig(key, value string) error {
	row := map[string]interface{}{
		"key":   key,
		"value": value,
	}
	var result []interface{}
	// Upsert using Supabase
	err := s.client.DB.From("system_settings").Upsert(row).Execute(&result)
	if err != nil {
		return err
	}

	// Reload Config
	return s.LoadConfig()
}
