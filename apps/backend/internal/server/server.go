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

	log.Println("Registering routes...")

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
	mux.Handle("PUT /api/admin/orgs/{id}", middleware.Auth(http.HandlerFunc(adminHandler.UpdateOrganization)))
	mux.Handle("DELETE /api/admin/orgs/{id}", middleware.Auth(http.HandlerFunc(adminHandler.DeleteOrganization)))

	// User Management
	mux.Handle("POST /api/admin/users", middleware.Auth(http.HandlerFunc(adminHandler.CreateUser)))
	mux.Handle("PUT /api/admin/users/{id}", middleware.Auth(http.HandlerFunc(adminHandler.UpdateUser)))
	mux.Handle("DELETE /api/admin/users/{id}", middleware.Auth(http.HandlerFunc(adminHandler.DeleteUser)))
	mux.Handle("POST /api/admin/users/{id}/block", middleware.Auth(http.HandlerFunc(adminHandler.BlockUser)))
	mux.Handle("POST /api/admin/users/{id}/reset-mfa", middleware.Auth(http.HandlerFunc(adminHandler.ResetUserMFA)))
	mux.Handle("POST /api/admin/users/{id}/password", middleware.Auth(http.HandlerFunc(adminHandler.ChangeUserPassword)))
	mux.Handle("POST /api/admin/users/{id}/role", middleware.Auth(http.HandlerFunc(adminHandler.UpdateUserRole)))

	// Flow Routes
	flowHandler := handlers.NewFlowHandler(s.temporalClient)
	mux.Handle("POST /api/flows", middleware.Auth(http.HandlerFunc(flowHandler.CreateFlow)))
	mux.Handle("PUT /api/flows/{id}", middleware.Auth(http.HandlerFunc(flowHandler.UpdateFlow)))
	mux.Handle("GET /api/flows/{id}", middleware.Auth(http.HandlerFunc(flowHandler.GetFlow)))
	mux.Handle("GET /api/flows", middleware.Auth(http.HandlerFunc(flowHandler.ListFlows)))
	mux.Handle("DELETE /api/flows/{id}", middleware.Auth(http.HandlerFunc(flowHandler.DeleteFlow)))

	// Action Flow Routes (Executions)
	actionFlowHandler := handlers.NewActionFlowHandler(s.temporalClient)
	mux.Handle("GET /api/action-flows", middleware.Auth(http.HandlerFunc(actionFlowHandler.ListActionFlows)))
	mux.Handle("GET /api/action-flows/{id}", middleware.Auth(http.HandlerFunc(actionFlowHandler.GetActionFlow)))
	mux.Handle("PATCH /api/action-flows/{id}", middleware.Auth(http.HandlerFunc(actionFlowHandler.UpdateActionFlow))) // Added
	mux.Handle("DELETE /api/action-flows/{id}", middleware.Auth(http.HandlerFunc(actionFlowHandler.DeleteActionFlow)))

	// Execution Routes
	if s.temporalClient != nil {
		executeHandler := handlers.NewExecuteFlowHandler(s.temporalClient)
		mux.Handle("POST /api/flows/{id}/execute", http.HandlerFunc(executeHandler.ExecuteFlow))
	}

	// Task Routes
	taskHandler := handlers.NewHumanTaskHandler(s.temporalClient)
	mux.Handle("GET /api/tasks", middleware.Auth(http.HandlerFunc(taskHandler.GetTasksHandler)))
	mux.Handle("POST /api/tasks/{id}/complete", middleware.Auth(http.HandlerFunc(taskHandler.CompleteTaskHandler)))

	// Comment Routes
	commentHandler := handlers.NewCommentHandler()
	mux.Handle("GET /api/comments", middleware.Auth(http.HandlerFunc(commentHandler.ListComments)))
	mux.Handle("POST /api/comments", middleware.Auth(http.HandlerFunc(commentHandler.CreateComment)))
	mux.Handle("POST /api/comments/{id}/like", middleware.Auth(http.HandlerFunc(commentHandler.ToggleLike)))

	// Test Routes (Dev only, but useful for frontend dev. Maybe keep public or optional? Let's protect them for consistency.)
	testHandler := handlers.NewTestHandler(s.temporalClient)
	mux.Handle("POST /api/test/node", middleware.Auth(http.HandlerFunc(handlers.TestNodeHandler)))
	mux.Handle("POST /api/test/flow", middleware.Auth(http.HandlerFunc(testHandler.TestFlow)))
	mux.Handle("GET /api/test/flow/{run_id}", middleware.Auth(http.HandlerFunc(handlers.GetFlowResultHandler)))
	mux.Handle("POST /api/test/flow/cancel", middleware.Auth(http.HandlerFunc(handlers.CancelFlowHandler)))

	// Publish Route
	mux.Handle("POST /api/flows/{id}/publish", middleware.Auth(http.HandlerFunc(flowHandler.PublishFlow)))

	// Organization Routes
	orgHandler := handlers.NewOrganizationHandler()
	mux.Handle("GET /api/orgs/lookup", middleware.Auth(http.HandlerFunc(orgHandler.GetOrgBySlug)))
	mux.Handle("GET /api/orgs/{orgId}/members", middleware.Auth(http.HandlerFunc(orgHandler.GetMembers)))
	mux.Handle("GET /api/orgs/{orgId}/teams", middleware.Auth(http.HandlerFunc(orgHandler.GetTeams)))
	mux.Handle("POST /api/orgs/{orgId}/teams", middleware.Auth(http.HandlerFunc(orgHandler.CreateTeam)))
	mux.Handle("GET /api/orgs/{orgId}/assignees", middleware.Auth(http.HandlerFunc(orgHandler.GetAssignees)))

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello from Nodal Backend! Supabase is connected."))
}
