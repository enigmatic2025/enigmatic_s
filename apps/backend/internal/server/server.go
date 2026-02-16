package server

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/config"
	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
	"github.com/teavana/enigmatic_s/apps/backend/internal/handlers"
	"github.com/teavana/enigmatic_s/apps/backend/internal/middleware"
	"github.com/teavana/enigmatic_s/apps/backend/internal/services"
	"go.temporal.io/sdk/client"
)

type Server struct {
	config         *config.Config
	temporalClient client.Client
	aiService      *services.AIService
}

func NewServer(cfg *config.Config) *http.Server {
	// Initialize Database
	database.Init(cfg.Auth.SupabaseURL, cfg.Auth.SupabaseKey)

	// Initialize Temporal Client
	// Note: In production we might want this to be lazy or retry, but for now we fail fast if Temporal isn't ready
	// The start.sh script ensures Temporal starts before this if running locally.
	// We might want to use cfg.Temporal.HostPort here in options if we were customizing it.
	c, err := client.Dial(client.Options{
		HostPort: cfg.Temporal.HostPort,
	})
	if err != nil {
		log.Printf("Failed to create Temporal client: %v", err)
	}

	dbClient := database.GetClient()
	aiService := services.NewAIService(dbClient)

	s := &Server{
		config:         cfg,
		temporalClient: c,
		aiService:      aiService,
	}

	// Declare Server config
	server := &http.Server{
		Addr: fmt.Sprintf(":%s", cfg.Server.Port),
		// Apply middleware: RequestID -> CORS -> Routes
		Handler:      middleware.RequestID(middleware.CORS(s.RegisterRoutes())),
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
	mux.HandleFunc("/health", s.HelloWorldHandler)

	// Initialize Handlers
	adminHandler := handlers.NewAdminHandler()
	aiHandler := handlers.NewAIHandler(s.aiService)
	orgCreditsHandler := handlers.NewOrgCreditsHandler()

	// Initialize Rate Limiter (10 requests per minute for AI endpoints)
	aiRateLimiter := middleware.NewRateLimiter(10)

	// Initialize Admin Middleware
	dbClient := database.GetClient()
	adminOnly := middleware.AdminOnly(dbClient)

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

	// Organization AI Credits Management (Admin only)
	mux.Handle("PUT /api/admin/orgs/{id}/credits", middleware.Auth(adminOnly(http.HandlerFunc(orgCreditsHandler.SetOrgCredits))))
	mux.Handle("POST /api/admin/orgs/{id}/credits/add", middleware.Auth(adminOnly(http.HandlerFunc(orgCreditsHandler.AddOrgCredits))))
	mux.Handle("PUT /api/admin/orgs/{id}/unlimited", middleware.Auth(adminOnly(http.HandlerFunc(orgCreditsHandler.SetUnlimitedAccess))))
	mux.Handle("GET /api/admin/orgs/{id}/credits/stats", middleware.Auth(adminOnly(http.HandlerFunc(orgCreditsHandler.GetOrgCreditsStats))))

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

	// Public routes (no auth)
	mux.Handle("GET /api/health", http.HandlerFunc(s.HelloWorldHandler))

	// Automation Routes
	if s.temporalClient != nil {
		automationHandler := handlers.NewAutomationHandler(s.temporalClient)
		mux.Handle("POST /api/automation/resume", http.HandlerFunc(automationHandler.ResumeAutomationHandler))
		mux.Handle("POST /api/automation/signal", http.HandlerFunc(automationHandler.SignalAutomationHandler))
	}

	// Task Routes
	taskHandler := handlers.NewHumanTaskHandler(s.temporalClient)
	mux.Handle("GET /api/tasks", middleware.Auth(http.HandlerFunc(taskHandler.GetTasksHandler)))
	mux.Handle("POST /api/tasks/{id}/complete", middleware.Auth(http.HandlerFunc(taskHandler.CompleteTaskHandler)))
	mux.Handle("PATCH /api/tasks/{id}", middleware.Auth(http.HandlerFunc(taskHandler.UpdateTaskHandler))) // Added

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
	mux.Handle("POST /api/orgs/{orgId}/members", middleware.Auth(http.HandlerFunc(orgHandler.CreateMember)))
	mux.Handle("PATCH /api/orgs/{orgId}/members/{userId}", middleware.Auth(http.HandlerFunc(orgHandler.UpdateMember)))
	mux.Handle("DELETE /api/orgs/{orgId}/members/{userId}", middleware.Auth(http.HandlerFunc(orgHandler.RemoveMember)))
	mux.Handle("GET /api/orgs/{orgId}/teams", middleware.Auth(http.HandlerFunc(orgHandler.GetTeams)))
	mux.Handle("POST /api/orgs/{orgId}/teams", middleware.Auth(http.HandlerFunc(orgHandler.CreateTeam)))
	mux.Handle("PATCH /api/orgs/{orgId}/teams/{teamId}", middleware.Auth(http.HandlerFunc(orgHandler.UpdateTeam)))
	mux.Handle("DELETE /api/orgs/{orgId}/teams/{teamId}", middleware.Auth(http.HandlerFunc(orgHandler.DeleteTeam)))
	mux.Handle("GET /api/orgs/{orgId}/teams/{teamId}/members", middleware.Auth(http.HandlerFunc(orgHandler.GetTeamMembers)))
	mux.Handle("POST /api/orgs/{orgId}/teams/{teamId}/members", middleware.Auth(http.HandlerFunc(orgHandler.AddTeamMember)))
	mux.Handle("DELETE /api/orgs/{orgId}/teams/{teamId}/members/{userId}", middleware.Auth(http.HandlerFunc(orgHandler.RemoveTeamMember)))
	mux.Handle("PATCH /api/orgs/{orgId}/teams/{teamId}/members/{userId}", middleware.Auth(http.HandlerFunc(orgHandler.UpdateTeamMemberRole)))
	mux.Handle("GET /api/orgs/{orgId}/assignees", middleware.Auth(http.HandlerFunc(orgHandler.GetAssignees)))

	// Activity Feed Routes
	activityHandler := handlers.NewActivityHandler()
	mux.Handle("GET /api/activity-feed", middleware.Auth(http.HandlerFunc(activityHandler.GetActivityFeed)))

	// User Routes (decoupled from direct Supabase frontend access)
	mux.Handle("GET /api/user/memberships", middleware.Auth(http.HandlerFunc(orgHandler.GetUserMemberships)))

	// AI Routes (with rate limiting)
	mux.Handle("POST /api/ai/chat", middleware.Auth(aiRateLimiter.Middleware(http.HandlerFunc(aiHandler.ChatHandler))))
	mux.Handle("POST /api/ai/chat/stream", middleware.Auth(aiRateLimiter.Middleware(http.HandlerFunc(aiHandler.StreamChatHandler))))

	// AI Admin Routes (require admin role)
	mux.Handle("GET /api/admin/ai-config", middleware.Auth(adminOnly(http.HandlerFunc(aiHandler.GetConfigHandler))))
	mux.Handle("PUT /api/admin/ai-config", middleware.Auth(adminOnly(http.HandlerFunc(aiHandler.UpdateConfigHandler))))
	mux.Handle("GET /api/admin/ai-stats", middleware.Auth(adminOnly(http.HandlerFunc(aiHandler.GetAIStatsHandler))))

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Health check received from %s", r.RemoteAddr)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hello from Nodal Backend! App is healthy."))
}
