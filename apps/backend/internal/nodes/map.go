package nodes

import (
	"context"
)

// MapNode transforms input data into a new structure.
// Config expects a "mappings" definition (not fully implemented in MVP).
type MapNode struct{}

// Execute performs the data transformation.
func (n *MapNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	mappings, ok := input.Config["mappings"].([]interface{})
	if !ok {
		// If no mappings, pass through
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

		// Simple variable substitution (MVP)
		// In a real engine, this would use the ExpressionEngine
		// Here we just check if source exists in InputData
		if val, exists := input.InputData[source]; exists {
			result[target] = val
		} else {
			// Literal value or missing
			result[target] = source
		}
	}

	return &NodeResult{
		Status: StatusSuccess,
		Output: result,
		Error:  "",
	}, nil
}
