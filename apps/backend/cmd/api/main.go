package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/teavana/enigmatic_s/apps/backend/internal/server"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	server := server.NewServer()

	fmt.Printf("Starting Nodal Backend on %s\n", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("cannot start server: %s", err)
	}
}
