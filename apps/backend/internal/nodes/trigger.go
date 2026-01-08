package nodes

import (
	"context"
)

type TriggerNode struct{}

func (n *TriggerNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Manual triggers are just entry points
	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"message":      "Manual Trigger Executed",
			"trigger_data": input.InputData,
		},
	}, nil
}
