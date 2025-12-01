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
	// User promotion
	mux.Handle("POST /admin/promote", middleware.Auth(http.HandlerFunc(adminHandler.PromoteToAdmin)))
	
	// List endpoints
	mux.Handle("GET /admin/users", middleware.Auth(http.HandlerFunc(adminHandler.ListUsers)))
	mux.Handle("GET /admin/orgs", middleware.Auth(http.HandlerFunc(adminHandler.ListOrgs)))
	
	// Organization CRUD
	mux.Handle("POST /admin/orgs", middleware.Auth(http.HandlerFunc(adminHandler.CreateOrganization)))
	mux.Handle("PUT /admin/orgs/", middleware.Auth(http.HandlerFunc(adminHandler.UpdateOrganization)))
	mux.Handle("DELETE /admin/orgs/", middleware.Auth(http.HandlerFunc(adminHandler.DeleteOrganization)))
	
	// User Management
	mux.Handle("POST /admin/users", middleware.Auth(http.HandlerFunc(adminHandler.CreateUser)))
	mux.Handle("PUT /admin/users/", middleware.Auth(http.HandlerFunc(adminHandler.UpdateUser)))
	mux.Handle("DELETE /admin/users/", middleware.Auth(http.HandlerFunc(adminHandler.DeleteUser)))
	mux.Handle("POST /admin/users/{id}/block", middleware.Auth(http.HandlerFunc(adminHandler.BlockUser)))
	mux.Handle("POST /admin/users/{id}/reset-mfa", middleware.Auth(http.HandlerFunc(adminHandler.ResetUserMFA)))
	mux.Handle("POST /admin/users/{id}/password", middleware.Auth(http.HandlerFunc(adminHandler.ChangeUserPassword)))
	mux.Handle("POST /admin/users/{id}/role", middleware.Auth(http.HandlerFunc(adminHandler.UpdateUserRole)))

	// Flow Routes
	flowHandler := handlers.NewFlowHandler()
	// TODO: Add Auth middleware once we have token passing from frontend
	mux.HandleFunc("POST /flows", flowHandler.CreateFlow)
	mux.HandleFunc("PUT /flows/", flowHandler.UpdateFlow)
	mux.HandleFunc("GET /flows/", flowHandler.GetFlow)

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello from Nodal Backend! Supabase is connected."))
}
