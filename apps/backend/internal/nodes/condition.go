package nodes

import (
	"context"
)

// ConditionNode evaluates a boolean condition.
// Config expects a "result" boolean (for MVP) or an expression string.
type ConditionNode struct{}

// Execute evaluates the condition and returns the result.
func (n *ConditionNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Config should contain "expression" or "conditions"
	// For this MVP, we'll check a simple boolean field in config "result"
	// In reality, this would use an expression engine.
	
	result := true // Default to true
	if val, ok := input.Config["result"].(bool); ok {
		result = val
	}

	return &NodeResult{
		Status: "SUCCESS",
		Output: map[string]interface{}{
			"result": result,
		},
	}, nil
}
