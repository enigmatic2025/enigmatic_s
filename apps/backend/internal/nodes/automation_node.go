package nodes

import (
	"context"
	"fmt"
)

type AutomationNodeExecutor struct{}

func (e *AutomationNodeExecutor) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Generate Correlation ID
	// For MVP, we use "run_id:node_id" as the action_id
	actionID := fmt.Sprintf("%s:%s", input.RunID, input.StepID)

	// 2. Prepare Metadata for UI
	// We return StatusPaused, which tells the workflow engine to suspend and wait for an event.
	// We pass the actionID so the UI can display the webhook URL.
	output := map[string]interface{}{
		"action_id": actionID,
		"status":    "waiting",
		"message":   "Waiting for external event...",
		// We can also pass the schema if we want to echo it back, but not strictly needed here
	}

	return &NodeResult{
		Status: StatusPaused,
		Output: output,
	}, nil
}
