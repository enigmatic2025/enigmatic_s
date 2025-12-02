package workflow

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// NodalWorkflow is the generic workflow that executes a graph of nodes
func NodalWorkflow(ctx workflow.Context, flowDefinition interface{}) (interface{}, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	logger := workflow.GetLogger(ctx)
	logger.Info("Nodal workflow started")

	// TODO: Parse flowDefinition and iterate through nodes
	// For now, just execute a dummy activity
	var result string
	err := workflow.ExecuteActivity(ctx, NodeExecutionActivity, "test-input").Get(ctx, &result)
	if err != nil {
		logger.Error("Activity failed", "Error", err)
		return nil, err
	}

	logger.Info("Nodal workflow completed", "Result", result)
	return result, nil
}
