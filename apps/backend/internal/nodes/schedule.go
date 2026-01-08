package nodes

import (
	"context"
)

// ScheduleNode is a no-op executor for time triggers.
// Since the workflow is already triggered (either by scheduler or manually),
// this node just acts as a pass-through marker in the execution graph.
type ScheduleNode struct{}

func (n *ScheduleNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// In a real system, we might check if we need to sleep if this is an intermediate node.
	// But usually "Time Trigger" is a root node.
	// Even if it is intermediate (e.g. "Wait"), for "Test Run" we usually want to skip or speed up.
	// For now, let's treat it as a success pass-through.

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"triggered_at": "now", // Mock output
		},
	}, nil
}
