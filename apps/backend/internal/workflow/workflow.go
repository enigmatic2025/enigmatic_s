package workflow

import (
	"fmt"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/nodes"
	"go.temporal.io/sdk/workflow"
)

// NodalWorkflow executes a graph of nodes with support for suspending/signals
func NodalWorkflow(ctx workflow.Context, flowDefinition FlowDefinition, inputData map[string]interface{}) (interface{}, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 1 * time.Minute, // Default timeout, can be overridden per node type
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	logger := workflow.GetLogger(ctx)
	logger.Info("Nodal workflow started", "Nodes", len(flowDefinition.Nodes))

	// 1. Sort the graph to determine execution order
	sortedNodes, err := TopologicalSort(flowDefinition)
	if err != nil {
		logger.Error("Graph sort failed", "Error", err)
		return nil, err
	}

	// 0. Record Execution in DB
	// 0. Initialize Execution State with Trigger Input
	executionState := make(map[string]map[string]interface{})
	executionState["trigger"] = map[string]interface{}{
		"body": inputData,
	}

	// 1. Find API Trigger Node configuration for Templating
	var titleTemplate, descTemplate string
	for _, node := range flowDefinition.Nodes {
		if node.Type == "api-trigger" {
			if t, ok := node.Data["instanceNameTemplate"].(string); ok {
				titleTemplate = t
			}
			if d, ok := node.Data["description"].(string); ok {
				descTemplate = d
			}
			break
		}
	}

	// 2. Record Execution in DB
	info := workflow.GetInfo(ctx)
	recordParams := RecordActionFlowParams{
		FlowID:      flowDefinition.ID,
		WorkflowID:  info.WorkflowExecution.ID,
		RunID:       info.WorkflowExecution.RunID,
		InputData:   inputData,
		Title:       titleTemplate,
		Description: descTemplate,
	}

	if err := workflow.ExecuteActivity(ctx, RecordActionFlowActivity, recordParams).Get(ctx, nil); err != nil {
		logger.Error("Failed to record action flow", "Error", err)
		return nil, err // Stop execution if we can't record the start
	}

	// 2. Iterate through sorted nodes
	for _, node := range sortedNodes {
		// Construct Context for the Node
		nodeCtx := nodes.NodeContext{
			WorkflowID: workflow.GetInfo(ctx).WorkflowExecution.ID,
			StepID:     node.ID,
			InputData: map[string]interface{}{
				"steps": executionState,
			},
			Config: node.Data,
		}

		// TODO: Map inputs from previous steps based on Edges.
		// For now, simplistically passing all previous state or relying on explicit 'steps.foo' references in Config.
		// In a real engine, we'd look at incoming edges to 'node.ID' and merge their outputs into 'InputData'.
		// Let's pass the entire executionState for now so the node can pick what it needs via expressions.
		// (Simplified for this sprint)

		var result nodes.NodeResult
		logger.Info("Executing Node", "ID", node.ID, "Type", node.Type)

		err := workflow.ExecuteActivity(ctx, NodeExecutionActivity, nodeCtx).Get(ctx, &result)
		if err != nil {
			logger.Error("Node execution failed", "ID", node.ID, "Error", err)
			return nil, err
		}

		// 3. Handle Suspension (Human-in-the-Loop)
		if result.Status == nodes.StatusPaused {
			logger.Info("Node requested suspension", "ID", node.ID)

			// Wait for a Signal
			// Signal name convention: "Resume-<NodeID>" or just a generic "Resume" with payload
			signalName := "Resume-" + node.ID
			var signalData interface{}

			selector := workflow.NewSelector(ctx)
			selector.AddReceive(workflow.GetSignalChannel(ctx, signalName), func(c workflow.ReceiveChannel, more bool) {
				c.Receive(ctx, &signalData)
			})

			// Block until signal received
			selector.Select(ctx)

			logger.Info("Signal received, resuming", "ID", node.ID, "Data", signalData)

			// Merge signal data into the result output
			if signalMap, ok := signalData.(map[string]interface{}); ok {
				if result.Output == nil {
					result.Output = make(map[string]interface{})
				}
				for k, v := range signalMap {
					result.Output[k] = v
				}
			}
			result.Status = nodes.StatusSuccess
		}

		if result.Status == nodes.StatusFailed {
			return nil, fmt.Errorf("node %s failed: %s", node.ID, result.Error)
		}

		// Store output for future steps
		executionState[node.ID] = result.Output
	}

	logger.Info("Nodal workflow completed successfully")
	return executionState, nil
}
