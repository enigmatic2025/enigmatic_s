package workflow

import (
	"context"
	"fmt"

	"github.com/teavana/enigmatic_s/apps/backend/internal/nodes"
)

// NodeExecutionActivity executes a single node by looking up its executor in the registry.
func NodeExecutionActivity(ctx context.Context, input nodes.NodeContext) (*nodes.NodeResult, error) {
	// 1. Get the executor for this node type
	// The node type should be passed in the input or config. 
	// For now, let's assume it's in the Config map under "type".
	nodeType, ok := input.Config["type"].(string)
	if !ok {
		return &nodes.NodeResult{
			Status: "FAILED",
			Error:  fmt.Errorf("node type not specified in config"),
		}, nil
	}

	executor, err := nodes.GetExecutor(nodeType)
	if err != nil {
		return &nodes.NodeResult{
			Status: "FAILED",
			Error:  err,
		}, nil
	}

	// 2. Execute the node
	result, err := executor.Execute(ctx, input)
	if err != nil {
		return &nodes.NodeResult{
			Status: "FAILED",
			Error:  err,
		}, nil
	}

	return result, nil
}
