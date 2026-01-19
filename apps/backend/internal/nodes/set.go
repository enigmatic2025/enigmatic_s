package nodes

import (
	"context"
	"fmt"
)

// SetNode is a data node that sets variables in the workflow state.
// Config expects a "variables" map where keys are variable names and values are the values to set.
type SetNode struct{}

// Execute returns the configured variables as output.
func (n *SetNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	output := make(map[string]interface{})
	engine := NewExpressionEngine()

	// 1. Handle flat structure (Frontend currently sends variableName/value)
	if name, ok := input.Config["variableName"].(string); ok && name != "" {
		valRaw := input.Config["value"]
		// Evaluate if it's a string
		if strVal, ok := valRaw.(string); ok {
			evaluated, err := engine.Evaluate(strVal, input)
			if err != nil {
				return nil, fmt.Errorf("failed to evaluate variable '%s': %v", name, err)
			}
			output[name] = evaluated
		} else {
			output[name] = valRaw
		}
	}

	// 2. Handle map structure (Legacy or advanced usage)
	if vars, ok := input.Config["variables"].(map[string]interface{}); ok {
		for k, v := range vars {
			if strVal, ok := v.(string); ok {
				evaluated, err := engine.Evaluate(strVal, input)
				if err != nil {
					return nil, fmt.Errorf("failed to evaluate variable '%s': %v", k, err)
				}
				output[k] = evaluated
			} else {
				output[k] = v
			}
		}
	}

	if len(output) == 0 {
		// Just a fallback to empty success if nothing configured
		// debug: return config to see what went wrong
		return &NodeResult{
			Status: "SUCCESS",
			Output: map[string]interface{}{
				"_debug_message":   "No variables set",
				"_received_config": input.Config,
			},
			Error: "",
		}, nil
	}

	return &NodeResult{
		Status: "SUCCESS",
		Output: output,
	}, nil
}
