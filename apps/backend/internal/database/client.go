package database

import (
	"log"
	"sync"

	"github.com/nedpals/supabase-go"
)

var (
	client *supabase.Client
	once   sync.Once
)

// Init initializes the Supabase client
// Init initializes the Supabase client
func Init(url, key string) {
	once.Do(func() {
		if url == "" || key == "" {
			log.Fatal("Supabase URL and Key must be set")
		}
		client = supabase.CreateClient(url, key)
	})
}

// GetClient returns the initialized Supabase client
func GetClient() *supabase.Client {
	if client == nil {
		log.Fatal("Database client not initialized. Call Init() first.")
	}
	return client
}
