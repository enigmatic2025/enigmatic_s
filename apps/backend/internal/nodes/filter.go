package nodes

import (
	"context"
)

type FilterNode struct{}

func (n *FilterNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Stub implementation for Filter
	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"message":        "Filter applied (Pass-through stub)",
			"filtered_count": 0,
		},
	}, nil
}
