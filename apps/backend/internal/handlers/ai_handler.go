package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/teavana/enigmatic_s/apps/backend/internal/services"
)

type AIHandler struct {
	aiService *services.AIService
}

func NewAIHandler(aiService *services.AIService) *AIHandler {
	return &AIHandler{aiService: aiService}
}

type ChatPayload struct {
	Message string `json:"message"`
	Context string `json:"context"` // Optional context from frontend
}

type ConfigPayload struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// ChatHandler handles POST /api/ai/chat
func (h *AIHandler) ChatHandler(w http.ResponseWriter, r *http.Request) {
	var payload ChatPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// TODO: Check Org Credit Balance here (Phase 1.5)

	systemPrompt := "You are Natalie, an expert automation assistant for the Enigmatic platform. Be concise, professional, and helpful."
	if payload.Context != "" {
		systemPrompt += "\n\nContext:\n" + payload.Context
	}

	response, err := h.aiService.GenerateResponse(r.Context(), systemPrompt, payload.Message)
	if err != nil {
		http.Error(w, "AI Service Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"response": response,
	})
}

// GetConfigHandler handles GET /api/admin/ai-config
func (h *AIHandler) GetConfigHandler(w http.ResponseWriter, r *http.Request) {
	config := h.aiService.GetConfig()

	// Obfuscate Key
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
