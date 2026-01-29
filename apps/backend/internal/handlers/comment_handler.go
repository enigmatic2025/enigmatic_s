package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
)

type CommentHandler struct{}

func NewCommentHandler() *CommentHandler {
	return &CommentHandler{}
}

// CommentRequest represents the body for creating a comment
type CommentRequest struct {
	OrgID        string `json:"org_id"`
	ActionFlowID string `json:"action_flow_id"`
	ActionID     string `json:"action_id,omitempty"` // Optional
	ParentID     string `json:"parent_id,omitempty"` // For linking replies
	Content      string `json:"content"`
}

// CreateComment handles POST /api/comments
func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	// 1. Decode Request
	var req CommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Content == "" || req.OrgID == "" || req.ActionFlowID == "" {
		http.Error(w, "Missing required fields (content, org_id, action_flow_id)", http.StatusBadRequest)
		return
	}

	// 2. Get User ID from Context (Set by Auth Middleware)
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized: User ID not found", http.StatusUnauthorized)
		return
	}

	client := database.GetClient()

	// 3. Prepare Record
	comment := map[string]interface{}{
		"org_id":         req.OrgID,
		"action_flow_id": req.ActionFlowID,
		"user_id":        userID,
		"content":        req.Content,
		"created_at":     time.Now(),
		"updated_at":     time.Now(),
	}

	if req.ActionID != "" {
		comment["action_id"] = req.ActionID
	}
	if req.ParentID != "" {
		comment["parent_id"] = req.ParentID
	}

	// 4. Insert into DB
	var results []map[string]interface{}
	// PostgREST Insert automatically returns the created objects if we ask, usually via headers or default.
	// Supabase Go client behavior:
	err := client.DB.From("comments").Insert(comment).Execute(&results)
	if err != nil {
		http.Error(w, "Failed to create comment: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 5. Return Created Comment
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if len(results) > 0 {
		json.NewEncoder(w).Encode(results[0])
	} else {
		// Fallback if return failed but insert succeeded (unlikely with PostgREST default)
		json.NewEncoder(w).Encode(comment)
	}
}

// ListComments handles GET /api/comments?action_flow_id=...
func (h *CommentHandler) ListComments(w http.ResponseWriter, r *http.Request) {
	actionFlowID := r.URL.Query().Get("action_flow_id")
	if actionFlowID == "" {
		http.Error(w, "Missing action_flow_id query parameter", http.StatusBadRequest)
		return
	}

	client := database.GetClient()

	type CommentResult struct {
		ID           string    `json:"id"`
		Content      string    `json:"content"`
		UserID       string    `json:"user_id"`
		ParentID     string    `json:"parent_id,omitempty"`
		CreatedAt    time.Time `json:"created_at"`
		LikeCount    int       `json:"like_count"`
		UserFullName string    `json:"user_full_name,omitempty"` // Joined manually or via view
		// We might need to join with profiles to get name/avatar
	}

	// Simple query first.
	// Note: We are sorting by default order (which is essentially random or insertion order in Postgres unless specified).
	// We'll let the frontend sort by Date for now to avoid dependency complexity here without importing the postgrest options.
	var comments []struct {
		ID        string    `json:"id"`
		Content   string    `json:"content"`
		UserID    string    `json:"user_id"`
		ParentID  *string   `json:"parent_id"`
		CreatedAt time.Time `json:"created_at"`
	}

	err := client.DB.From("comments").
		Select("*").
		Eq("action_flow_id", actionFlowID).
		Execute(&comments)

	if err != nil {
		http.Error(w, "Failed to fetch comments: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Hydrate User Info AND Likes
	var enrichedComments []map[string]interface{}

	if len(comments) > 0 {
		userIDs := make([]string, 0)
		commentIDs := make([]string, 0)
		seen := make(map[string]bool)
		for _, c := range comments {
			if !seen[c.UserID] {
				userIDs = append(userIDs, c.UserID)
				seen[c.UserID] = true
			}
			commentIDs = append(commentIDs, c.ID)
		}

		// 1. Fetch User Profiles
		userMap := make(map[string]string) // ID -> Name
		if len(userIDs) > 0 {
			var p []struct {
				ID       string `json:"id"`
				FullName string `json:"full_name"`
			}
			client.DB.From("profiles").Select("id, full_name").In("id", userIDs).Execute(&p)
			for _, profile := range p {
				userMap[profile.ID] = profile.FullName
			}
		}

		// 2. Fetch Likes for these comments
		var likes []struct {
			CommentID string `json:"comment_id"`
			UserID    string `json:"user_id"`
		}
		// Note: Supabase/PostgREST 'In' query usually takes a comma-separated string for array
		// We need to implement this correctly. The client.DB.In() should handle slice or we join.
		// Assuming Execute with In takes slice.
		client.DB.From("comment_likes").Select("comment_id, user_id").In("comment_id", commentIDs).Execute(&likes)

		likeCounts := make(map[string]int)
		userLiked := make(map[string]bool)
		currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)

		for _, l := range likes {
			likeCounts[l.CommentID]++
			if l.UserID == currentUserID {
				userLiked[l.CommentID] = true
			}
		}

		// Build Response
		for _, c := range comments {
			uName := userMap[c.UserID]
			if uName == "" {
				uName = "Unknown User"
			}

			enriched := map[string]interface{}{
				"id":         c.ID,
				"content":    c.Content,
				"user_id":    c.UserID,
				"parent_id":  c.ParentID,
				"created_at": c.CreatedAt,
				"user_name":  uName,
				"like_count": likeCounts[c.ID],
				"is_liked":   userLiked[c.ID],
			}
			enrichedComments = append(enrichedComments, enriched)
		}
	} else {
		enrichedComments = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrichedComments)
}

// ToggleLike handles POST /api/comments/{id}/like
func (h *CommentHandler) ToggleLike(w http.ResponseWriter, r *http.Request) {
	commentID := r.PathValue("id")
	if commentID == "" {
		http.Error(w, "Missing comment ID", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	client := database.GetClient()

	// Check if like exists
	// Assuming table 'comment_likes' exists with comment_id, user_id
	var likes []map[string]interface{}
	err := client.DB.From("comment_likes").
		Select("user_id").
		Eq("comment_id", commentID).
		Eq("user_id", userID).
		Execute(&likes)

	if err != nil {
		// Table might not exist or other DB error
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(likes) > 0 {
		// Unlike
		err = client.DB.From("comment_likes").
			Delete().
			Eq("comment_id", commentID).
			Eq("user_id", userID).
			Execute(nil)
	} else {
		// Like
		likeRecord := map[string]string{
			"comment_id": commentID,
			"user_id":    userID,
		}
		err = client.DB.From("comment_likes").Insert(likeRecord).Execute(nil)
	}

	if err != nil {
		http.Error(w, "Failed to toggle like: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
