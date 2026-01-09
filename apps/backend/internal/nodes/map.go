package nodes

import (
	"context"
)

// MapNode transforms input data into a new structure.
// Config expects a "mappings" definition (not fully implemented in MVP).
type MapNode struct{}

// Execute performs the data transformation.
func (n *MapNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Resolve Config using Expression Engine
	// This ensures {{ steps.foo }} references work correctly
	engine := NewExpressionEngine()

	mappings, ok := input.Config["mappings"].([]interface{})
	if !ok {
		// If no mappings, pass through input
		// Or strictly, return empty? Usually pass-through or error.
		// Let's pass through input data for now.
		return &NodeResult{
			Status: "SUCCESS",
			Output: input.InputData,
		}, nil
	}

	result := make(map[string]interface{})

	for _, m := range mappings {
		mapping, ok := m.(map[string]interface{})
		if !ok {
			continue
		}
		target, _ := mapping["target"].(string)
		source, _ := mapping["source"].(string)

		if target == "" {
			continue
		}

		// Evaluate the source expression
		// If source is like "{{ steps.foo.data }}", engine handles it.
		// If it's a static string, engine returns it as is.
		val, err := engine.Evaluate(source, input)
		if err != nil {
			// If eval fails, maybe treat as literal or error?
			// For Map node, we might want to return nil or empty string.
			// Let's log/continue or just set as is.
			// But for reliability, let's treat it as the value itself if eval failed (fallback)
			result[target] = source
		} else {
			result[target] = val
		}
	}

	return &NodeResult{
		Status: StatusSuccess,
		Output: result,
		Error:  "",
	}, nil
}
