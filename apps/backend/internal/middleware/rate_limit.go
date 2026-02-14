package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/teavana/enigmatic_s/apps/backend/internal/metrics"
)

// RateLimiter implements a simple in-memory rate limiter
// For production, use Redis-backed rate limiting for distributed systems
type RateLimiter struct {
	requests map[string]*rateLimitEntry
	mu       sync.RWMutex
	logger   *logrus.Logger

	// Configuration
	requestsPerMinute int
	cleanupInterval   time.Duration
}

type rateLimitEntry struct {
	count      int
	resetAt    time.Time
	lastCleanup time.Time
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(requestsPerMinute int) *RateLimiter {
	rl := &RateLimiter{
		requests:          make(map[string]*rateLimitEntry),
		logger:            logrus.New(),
		requestsPerMinute: requestsPerMinute,
		cleanupInterval:   5 * time.Minute,
	}

	// Start cleanup goroutine
	go rl.cleanup()

	return rl
}

// Middleware returns the rate limiting middleware
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get user ID from context (set by auth middleware)
		userID, ok := r.Context().Value(UserIDKey).(string)
		if !ok {
			// If no user ID, use IP address as fallback
			userID = r.RemoteAddr
		}

		// Check rate limit
		if !rl.allow(userID) {
			rl.logger.Warnf("Rate limit exceeded for user %s", userID)
			metrics.RecordRateLimitHit(r.URL.Path) // Record metrics
			w.Header().Set("X-RateLimit-Limit", string(rune(rl.requestsPerMinute)))
			w.Header().Set("X-RateLimit-Remaining", "0")
			w.Header().Set("Retry-After", "60")
			http.Error(w, "Rate limit exceeded. Please try again later.", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// allow checks if a request is allowed for the given key
func (rl *RateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.requests[key]

	if !exists || now.After(entry.resetAt) {
		// New window or expired window
		rl.requests[key] = &rateLimitEntry{
			count:   1,
			resetAt: now.Add(time.Minute),
		}
		return true
	}

	// Check if limit exceeded
	if entry.count >= rl.requestsPerMinute {
		return false
	}

	// Increment counter
	entry.count++
	return true
}

// cleanup periodically removes old entries
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.cleanupInterval)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, entry := range rl.requests {
			if now.After(entry.resetAt.Add(rl.cleanupInterval)) {
				delete(rl.requests, key)
			}
		}
		rl.mu.Unlock()
	}
}

// GetStats returns current rate limiter stats (for monitoring)
func (rl *RateLimiter) GetStats() map[string]interface{} {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	return map[string]interface{}{
		"tracked_users":       len(rl.requests),
		"requests_per_minute": rl.requestsPerMinute,
	}
}
