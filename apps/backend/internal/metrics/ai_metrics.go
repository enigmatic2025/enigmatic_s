package metrics

import (
	"log"
	"sync"
)

// Simple in-memory metrics for monitoring
// To enable Prometheus metrics, run: go get github.com/prometheus/client_golang
// Then uncomment the Prometheus implementation below

var (
	mu             sync.RWMutex
	requestCounts  = make(map[string]int)
	tokenCounts    = make(map[string]int)
	creditCounts   = make(map[string]int)
	guardrailCount = make(map[string]int)
	rateLimitCount = make(map[string]int)
	retryCount     = make(map[string]int)
	piiCount       = make(map[string]int)
	metricsEnabled = true
)

// RecordAIRequest records an AI request with status and duration
func RecordAIRequest(status, model string, duration float64, endpoint string) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	key := status + ":" + model
	requestCounts[key]++
}

// RecordTokenUsage records token usage
func RecordTokenUsage(model string, promptTokens, completionTokens int) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	tokenCounts["prompt:"+model] += promptTokens
	tokenCounts["completion:"+model] += completionTokens
}

// RecordCreditUsage records credit consumption
func RecordCreditUsage(orgID string, credits int) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	creditCounts[orgID] += credits
}

// RecordGuardrailBlock records a guardrail block
func RecordGuardrailBlock(reason string) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	guardrailCount[reason]++
}

// RecordRateLimitHit records a rate limit hit
func RecordRateLimitHit(endpoint string) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	rateLimitCount[endpoint]++
}

// RecordRetry records a retry attempt
func RecordRetry(reason string) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	retryCount[reason]++
}

// RecordPIIDetection records PII detection
func RecordPIIDetection(piiType string) {
	if !metricsEnabled {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	piiCount[piiType]++
}

// GetMetrics returns current metrics snapshot (for debugging/monitoring endpoint)
func GetMetrics() map[string]interface{} {
	mu.RLock()
	defer mu.RUnlock()

	return map[string]interface{}{
		"requests":    copyMap(requestCounts),
		"tokens":      copyMap(tokenCounts),
		"credits":     copyMap(creditCounts),
		"guardrails":  copyMap(guardrailCount),
		"rate_limits": copyMap(rateLimitCount),
		"retries":     copyMap(retryCount),
		"pii":         copyMap(piiCount),
	}
}

func copyMap(m map[string]int) map[string]int {
	c := make(map[string]int)
	for k, v := range m {
		c[k] = v
	}
	return c
}

// DisableMetrics turns off metrics collection
func DisableMetrics() {
	metricsEnabled = false
}

// EnableMetrics turns on metrics collection
func EnableMetrics() {
	metricsEnabled = true
}

// LogMetricsSummary logs current metrics to console
func LogMetricsSummary() {
	metrics := GetMetrics()
	log.Printf("=== Metrics Summary ===")
	log.Printf("Requests: %v", metrics["requests"])
	log.Printf("Tokens: %v", metrics["tokens"])
	log.Printf("Credits: %v", metrics["credits"])
	log.Printf("Guardrails: %v", metrics["guardrails"])
	log.Printf("Rate Limits: %v", metrics["rate_limits"])
	log.Printf("Retries: %v", metrics["retries"])
	log.Printf("PII Detections: %v", metrics["pii"])
}
