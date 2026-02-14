package services

import (
	"fmt"
	"sync"
	"time"
)

// CircuitState represents the current state of the circuit breaker
type CircuitState int

const (
	StateClosed CircuitState = iota // Normal operation
	StateOpen                        // Failing, reject requests
	StateHalfOpen                    // Testing if service recovered
)

// CircuitBreaker implements the circuit breaker pattern
// Prevents cascading failures by stopping requests to a failing service
type CircuitBreaker struct {
	mu sync.RWMutex

	maxFailures  int           // Failures before opening circuit
	resetTimeout time.Duration // Time before attempting recovery

	state         CircuitState
	failures      int
	lastFailTime  time.Time
	lastStateTime time.Time
}

// NewCircuitBreaker creates a new circuit breaker
func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		maxFailures:   maxFailures,
		resetTimeout:  resetTimeout,
		state:         StateClosed,
		failures:      0,
		lastStateTime: time.Now(),
	}
}

// Execute runs the given function with circuit breaker protection
func (cb *CircuitBreaker) Execute(fn func() error) error {
	// Check if we can execute
	if !cb.canExecute() {
		return fmt.Errorf("circuit breaker is OPEN (service unavailable)")
	}

	// Execute the function
	err := fn()

	// Record result
	if err != nil {
		cb.recordFailure()
		return err
	}

	cb.recordSuccess()
	return nil
}

// canExecute checks if the circuit allows execution
func (cb *CircuitBreaker) canExecute() bool {
	cb.mu.RLock()
	defer cb.mu.RUnlock()

	switch cb.state {
	case StateClosed:
		return true
	case StateOpen:
		// Check if enough time has passed to try again
		if time.Since(cb.lastStateTime) > cb.resetTimeout {
			return true // Will transition to half-open on next execute
		}
		return false
	case StateHalfOpen:
		return true
	default:
		return false
	}
}

// recordSuccess records a successful execution
func (cb *CircuitBreaker) recordSuccess() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.failures = 0

	if cb.state == StateHalfOpen {
		// Recovery confirmed, close the circuit
		cb.state = StateClosed
		cb.lastStateTime = time.Now()
	}
}

// recordFailure records a failed execution
func (cb *CircuitBreaker) recordFailure() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.failures++
	cb.lastFailTime = time.Now()

	if cb.state == StateHalfOpen {
		// Failure during recovery, go back to open
		cb.state = StateOpen
		cb.lastStateTime = time.Now()
		return
	}

	// Check if we should open the circuit
	if cb.failures >= cb.maxFailures {
		cb.state = StateOpen
		cb.lastStateTime = time.Now()
	}
}

// GetState returns the current state of the circuit breaker
func (cb *CircuitBreaker) GetState() CircuitState {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}

// GetStats returns current circuit breaker statistics
func (cb *CircuitBreaker) GetStats() map[string]interface{} {
	cb.mu.RLock()
	defer cb.mu.RUnlock()

	stateStr := "CLOSED"
	switch cb.state {
	case StateOpen:
		stateStr = "OPEN"
	case StateHalfOpen:
		stateStr = "HALF_OPEN"
	}

	return map[string]interface{}{
		"state":            stateStr,
		"failures":         cb.failures,
		"max_failures":     cb.maxFailures,
		"last_fail_time":   cb.lastFailTime,
		"last_state_time":  cb.lastStateTime,
		"reset_timeout_ms": cb.resetTimeout.Milliseconds(),
	}
}

// Reset manually resets the circuit breaker to closed state
func (cb *CircuitBreaker) Reset() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.state = StateClosed
	cb.failures = 0
	cb.lastStateTime = time.Now()
}
