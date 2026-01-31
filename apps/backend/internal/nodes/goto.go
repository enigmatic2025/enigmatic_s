package nodes

import (
	"context"
)

// GotoNode signals a jump to another node.
type GotoNode struct{}

func (n *GotoNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	targetID, ok := input.Config["targetId"].(string)
	if !ok || targetID == "" {
		return &NodeResult{
			Status: StatusFailed,
			Error:  "Missing 'targetId' configuration for Goto node",
		}, nil
	}

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"_goto_target": targetID, // Special signal key for the engine
		},
	}, nil
}
