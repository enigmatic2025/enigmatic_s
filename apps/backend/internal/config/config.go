package config

import (
	"os"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Temporal TemporalConfig
	Auth     AuthConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	URL string
}

type TemporalConfig struct {
	HostPort string
}

type AuthConfig struct {
	SupabaseURL string
	SupabaseKey string
	JWTSecret   string
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8000"),
		},
		Database: DatabaseConfig{
			URL: getEnv("DATABASE_URL", ""),
		},
		Temporal: TemporalConfig{
			HostPort: getEnv("TEMPORAL_HOST_PORT", "localhost:7233"),
		},
		Auth: AuthConfig{
			SupabaseURL: getEnv("SUPABASE_URL", ""),
			SupabaseKey: getEnv("SUPABASE_KEY", ""),
			JWTSecret:   getEnv("SUPABASE_JWT_SECRET", ""),
		},
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
