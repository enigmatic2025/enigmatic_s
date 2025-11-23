package database

import (
	"log"
	"os"
	"sync"

	"github.com/nedpals/supabase-go"
)

var (
	client *supabase.Client
	once   sync.Once
)

// Init initializes the Supabase client
func Init() {
	once.Do(func() {
		supabaseUrl := os.Getenv("SUPABASE_URL")
		supabaseKey := os.Getenv("SUPABASE_KEY")

		if supabaseUrl == "" || supabaseKey == "" {
			log.Fatal("SUPABASE_URL and SUPABASE_KEY must be set")
		}

		client = supabase.CreateClient(supabaseUrl, supabaseKey)
	})
}

// GetClient returns the initialized Supabase client
func GetClient() *supabase.Client {
	if client == nil {
		Init()
	}
	return client
}
