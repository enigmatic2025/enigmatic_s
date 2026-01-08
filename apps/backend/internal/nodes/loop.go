package nodes

import (
	"context"
	"fmt"
)

type LoopNode struct{}

func (n *LoopNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Stub implementation
	// In a real loop, this would handle iterator logic, but for now we just pass through.
	// The graph traversal logic handles the actual looping structure usually,
	// or this node returns a special status/output to drive the iterator.

	items, ok := input.Config["items"]
	if !ok {
		return &NodeResult{
			Status: StatusFailed,
			Error:  "Missing 'items' configuration for Loop",
		}, nil
	}

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"message": fmt.Sprintf("Looping over %v", items),
			"items":   items,
		},
	}, nil
}
