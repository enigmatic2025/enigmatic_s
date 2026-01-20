package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/handlers"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
	"go.temporal.io/sdk/client"
)

type Server struct {
	port           string
	temporalClient client.Client
}

func NewServer() *http.Server {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize Database
	database.Init()

	// Initialize Temporal Client
	// Note: In production we might want this to be lazy or retry, but for now we fail fast if Temporal isn't ready
	// The start.sh script ensures Temporal starts before this if running locally.
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Printf("Failed to create Temporal client: %v", err)
	}

	s := &Server{
		port:           port,
		temporalClient: c,
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", s.port),
		Handler:      middleware.CORS(s.RegisterRoutes()),
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
	mux.Handle("POST /api/admin/promote", middleware.Auth(http.HandlerFunc(adminHandler.PromoteToAdmin)))

	// List endpoints
	mux.Handle("GET /api/admin/users", middleware.Auth(http.HandlerFunc(adminHandler.ListUsers)))
	mux.Handle("GET /api/admin/orgs", middleware.Auth(http.HandlerFunc(adminHandler.ListOrgs)))

	// Organization CRUD
	mux.Handle("POST /api/admin/orgs", middleware.Auth(http.HandlerFunc(adminHandler.CreateOrganization)))
	mux.Handle("PUT /api/admin/orgs/", middleware.Auth(http.HandlerFunc(adminHandler.UpdateOrganization)))
	mux.Handle("DELETE /api/admin/orgs/", middleware.Auth(http.HandlerFunc(adminHandler.DeleteOrganization)))

	// User Management
	mux.Handle("POST /api/admin/users", middleware.Auth(http.HandlerFunc(adminHandler.CreateUser)))
	mux.Handle("PUT /api/admin/users/", middleware.Auth(http.HandlerFunc(adminHandler.UpdateUser)))
	mux.Handle("DELETE /api/admin/users/", middleware.Auth(http.HandlerFunc(adminHandler.DeleteUser)))
	mux.Handle("POST /api/admin/users/{id}/block", middleware.Auth(http.HandlerFunc(adminHandler.BlockUser)))
	mux.Handle("POST /api/admin/users/{id}/reset-mfa", middleware.Auth(http.HandlerFunc(adminHandler.ResetUserMFA)))
	mux.Handle("POST /api/admin/users/{id}/password", middleware.Auth(http.HandlerFunc(adminHandler.ChangeUserPassword)))
	mux.Handle("POST /api/admin/users/{id}/role", middleware.Auth(http.HandlerFunc(adminHandler.UpdateUserRole)))

	// Flow Routes
	flowHandler := handlers.NewFlowHandler()
	// TODO: Add Auth middleware once we have token passing from frontend
	mux.HandleFunc("POST /api/flows", flowHandler.CreateFlow)
	mux.HandleFunc("PUT /api/flows/{id}", flowHandler.UpdateFlow)
	mux.HandleFunc("GET /api/flows/{id}", flowHandler.GetFlow)
	mux.HandleFunc("GET /api/flows", flowHandler.ListFlows)
	mux.HandleFunc("DELETE /api/flows/{id}", flowHandler.DeleteFlow)

	// Execution Routes
	if s.temporalClient != nil {
		executeHandler := handlers.NewExecuteFlowHandler(s.temporalClient)
		mux.HandleFunc("POST /api/flows/{id}/execute", executeHandler.ExecuteFlow)
	}

	// Test Routes (Dev only, but useful for frontend dev)
	testHandler := handlers.NewTestHandler(s.temporalClient)
	mux.HandleFunc("POST /api/test/node", handlers.TestNodeHandler)
	mux.HandleFunc("POST /api/test/flow", testHandler.TestFlow)
	mux.HandleFunc("GET /api/test/flow/", handlers.GetFlowResultHandler)
	mux.HandleFunc("POST /api/test/flow/cancel", handlers.CancelFlowHandler)

	// Publish Route
	mux.HandleFunc("POST /api/flows/{id}/publish", flowHandler.PublishFlow)

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello from Nodal Backend! Supabase is connected."))
}
