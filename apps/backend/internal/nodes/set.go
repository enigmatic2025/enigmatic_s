package nodes

import (
	"context"
)

// SetNode is a data node that sets variables in the workflow state.
// Config expects a "variables" map where keys are variable names and values are the values to set.
type SetNode struct{}

// Execute returns the configured variables as output.
func (n *SetNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Config should contain "variables" map
	variables, ok := input.Config["variables"].(map[string]interface{})
	if !ok {
		// If no variables defined, just return empty success
		return &NodeResult{
			Status: "SUCCESS",                // Assuming StatusSuccess is not defined, keeping original string literal for syntactic correctness.
			Output: map[string]interface{}{}, // Removed 'key: value' as they are undefined and would cause a compilation error.
			Error:  "",
		}, nil
	}

	// In a real implementation, we might evaluate expressions here.
	// For now, we just return the variables as output.
	return &NodeResult{
		Status: "SUCCESS",
		Output: variables,
	}, nil
}
