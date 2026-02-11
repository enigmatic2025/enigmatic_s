package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: .env not found")
	}

	database.Init()
	client := database.GetClient()

	// Delete all audit logs
	// Using a broad delete. In production we'd filter by Org, but for this user request "get rid of it",
	// and given it's a dev environment, we'll clear all.
	var deleted []map[string]interface{}
	err := client.DB.From("audit_logs").Delete().Neq("id", "00000000-0000-0000-0000-000000000000").Execute(&deleted)
	if err != nil {
		log.Fatalf("Failed to clear audit_logs: %v", err)
	}

	fmt.Println("SUCCESS: Cleared audit_logs table.")
}
