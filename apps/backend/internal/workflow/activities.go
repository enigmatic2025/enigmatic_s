package workflow

import (
	"context"
	"fmt"

	"github.com/teavana/enigmatic_s/apps/backend/internal/nodes"
)

// NodeExecutionActivity executes a single node by looking up its executor in the registry.
func NodeExecutionActivity(ctx context.Context, input nodes.NodeContext) (*nodes.NodeResult, error) {
	// 1. Get Executor
	executor, err := nodes.GetExecutor(input.Config["type"].(string), input.Config)
	if err != nil {
		return &nodes.NodeResult{
			Status: nodes.StatusFailed,
			Error:  fmt.Sprintf("node type not specified or unknown: %v", err),
		}, nil
	}

	// 2. Execute
	result, err := executor.Execute(ctx, input)
	if err != nil {
		return &nodes.NodeResult{
			Status: nodes.StatusFailed,
			Error:  err.Error(),
		}, nil
	}

	// 3. Return result
	if result == nil {
		return &nodes.NodeResult{
			Status: nodes.StatusFailed,
			Error:  "node execution returned null result",
		}, nil
	}

	return result, nil
}
