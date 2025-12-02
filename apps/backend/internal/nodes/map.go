package nodes

import (
	"context"
)

// MapNode transforms input data into a new structure.
// Config expects a "mappings" definition (not fully implemented in MVP).
type MapNode struct{}

// Execute performs the data transformation.
func (n *MapNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Config should contain "mappings"
	// For MVP, we just pass through input.
	
	return &NodeResult{
		Status: "SUCCESS",
		Output: input.InputData,
	}, nil
}
