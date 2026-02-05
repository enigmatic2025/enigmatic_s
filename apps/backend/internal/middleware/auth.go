package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/golang-jwt/jwt/v5"
)

// ContextKey is a custom type for context keys to avoid collisions
type ContextKey string

const UserIDKey ContextKey = "userID"

var jwks *keyfunc.JWKS

func init() {
	// Initialize JWKS on startup
	supabaseURL := os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		log.Println("WARNING: SUPABASE_URL not set, JWKS init skipped")
		return
	}

	jwksURL := fmt.Sprintf("%s/auth/v1/.well-known/jwks.json", supabaseURL)

	// Create the JWKS from the resource at the given URL.
	var err error
	options := keyfunc.Options{
		RefreshErrorHandler: func(err error) {
			log.Printf("There was an error with the JWKS refresh: %v", err)
		},
		RefreshInterval:   time.Hour,
		RefreshRateLimit:  time.Minute * 5,
		RefreshTimeout:    time.Second * 10,
		RefreshUnknownKID: true,
	}
	jwks, err = keyfunc.Get(jwksURL, options)
	if err != nil {
		log.Printf("Failed to create JWKS from resource at the given URL.\nError: %v", err)
		// Don't fatal here, allow retry in middleware or manual fix
	} else {
		log.Println("JWKS initialized successfully")
	}
}

// Auth verifies the Supabase JWT token using JWKS
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Invalid token format", http.StatusUnauthorized)
			return
		}

		// 1. Try to parse with JWKS (for new ECC/RSA keys)
		var token *jwt.Token
		var err error
		if jwks != nil {
			token, err = jwt.Parse(tokenString, jwks.Keyfunc)
		} else {
			err = fmt.Errorf("JWKS not initialized")
		}

		// 2. If JWKS fails, try fallback to HMAC Secret (for legacy/local keys)
		if err != nil {
			jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
			if jwtSecret == "" {
				jwtSecret = os.Getenv("SUPABASE_KEY")
			}

			// Retry with HMAC
			var hmacErr error
			token, hmacErr = jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			// If both failed, log the JWKS error (usually more relevant) and return unauthorized
			if hmacErr != nil {
				log.Printf("Failed to parse JWT with both JWKS and HMAC.\nJWKS Error: %v\nHMAC Error: %v", err, hmacErr)
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}
		}

		if !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok {
			http.Error(w, "User ID not found in token", http.StatusUnauthorized)
			return
		}

		// Add UserID to context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
