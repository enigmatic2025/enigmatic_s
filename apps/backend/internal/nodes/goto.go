package nodes

import (
	"context"
	"fmt"
)

// GotoNode signals a jump to another node.
type GotoNode struct{}

func (n *GotoNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	fmt.Printf("DEBUG: GotoNode Config: %+v\n", input.Config) // Debug Log
	targetID, ok := input.Config["targetId"].(string)

	// Fallback for different key cases if needed
	if !ok || targetID == "" {
		if t, ok2 := input.Config["target_id"].(string); ok2 {
			targetID = t
			ok = true
		} else if t, ok3 := input.Config["target"].(string); ok3 {
			targetID = t
			ok = true
		}
	}

	if !ok || targetID == "" {
		fmt.Printf("DEBUG: GotoNode Missing TargetID\n")
		return &NodeResult{
			Status: StatusFailed,
			Error:  "Missing 'targetId' configuration for Goto node",
		}, nil
	}

	fmt.Printf("DEBUG: GotoNode Jumping to: %s\n", targetID)

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"_goto_target": targetID, // Special signal key for the engine
		},
	}, nil
}
