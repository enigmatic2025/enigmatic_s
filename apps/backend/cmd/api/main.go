package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/teavana/enigmatic_s/apps/backend/internal/server"
	"github.com/teavana/enigmatic_s/apps/backend/internal/workflow"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Start Temporal Worker
	go workflow.StartWorker()

	server := server.NewServer()

	fmt.Printf("Starting Nodal Backend on %s\n", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("cannot start server: %s", err)
	}
}
