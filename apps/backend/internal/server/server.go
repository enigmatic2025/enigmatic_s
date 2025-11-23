package server

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/handlers"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
)

type Server struct {
	port string
}

func NewServer() *http.Server {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize Database
	database.Init()

	s := &Server{
		port: port,
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", s.port),
		Handler:      s.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("/", s.HelloWorldHandler)

	// Initialize Handlers
	adminHandler := handlers.NewAdminHandler()

	// Protected Admin Routes (Require Auth Middleware)
	mux.Handle("POST /admin/promote", middleware.Auth(http.HandlerFunc(adminHandler.PromoteToAdmin)))
	mux.Handle("GET /admin/users", middleware.Auth(http.HandlerFunc(adminHandler.ListUsers)))
	mux.Handle("GET /admin/orgs", middleware.Auth(http.HandlerFunc(adminHandler.ListOrgs)))

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello from Nodal Backend! Supabase is connected."))
}
