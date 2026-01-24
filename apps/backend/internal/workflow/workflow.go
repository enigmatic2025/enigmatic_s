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

	// 0. Initialize Execution State
	executionState := make(map[string]map[string]interface{})
	variables := make(map[string]interface{}) // Global variables state

	// Initialize 'trigger' scope with input data (standard convention)
	executionState["trigger"] = map[string]interface{}{
		"body": inputData,
	}

	// 1. Find API Trigger Node configuration for Templating AND pre-populate node output
	var titleTemplate, descTemplate string
	for _, node := range flowDefinition.Nodes {
		// Populate the specific node ID with the input data (Flat, for variable constraints)
		// This ensures {{ steps.node_id.field }} works directly on the payload
		if node.Type == "api-trigger" || node.Type == "manual-trigger" || node.Type == "webhook" {
			executionState[node.ID] = inputData
		}

		if node.Type == "api-trigger" {
			if t, ok := node.Data["instanceNameTemplate"].(string); ok {
				titleTemplate = t
			}
			if d, ok := node.Data["instanceDescriptionTemplate"].(string); ok {
				descTemplate = d
			} else if d, ok := node.Data["description"].(string); ok {
				// Fallback to legacy description if new field is empty
				descTemplate = d
			}
			break
		}
	}

	// 1.5 Evaluate Templates (Title, Description) before Recording
	// We need to resolve variables like {{ steps.trigger.data.id }} immediately so the Dashboard title is useful
	info := workflow.GetInfo(ctx)
	expressionEngine := nodes.NewExpressionEngine()

	// Create a context for evaluation
	// Note: At this very start moment, only 'trigger' (and aliases) exist in executionState
	evalCtx := nodes.NodeContext{
		FlowID:     flowDefinition.ID,
		WorkflowID: info.WorkflowExecution.ID,
		InputData: map[string]interface{}{
			"steps":     executionState,
			"variables": variables,
			"input":     inputData, // For backward compatibility or direct access
		},
	}

	if titleTemplate != "" {
		if val, err := expressionEngine.Evaluate(titleTemplate, evalCtx); err == nil {
			titleTemplate = fmt.Sprintf("%v", val)
		}
	}
	// Note: We intentionally don't evaluate Description here fully if it's meant to be static,
	// but if user wants dynamic descriptions (e.g. "Order #123"), we should support it.
	// Users requested decoupling, so description might be static info.
	// However, evaluating it enables "Order #{{id}} details". Let's evaluate it too.
	if descTemplate != "" {
		if val, err := expressionEngine.Evaluate(descTemplate, evalCtx); err == nil {
			descTemplate = fmt.Sprintf("%v", val)
		}
	}

	// 2. Record Execution in DB
	// info variable is already defined above in original code, but we need it here if moving things?
	// Ah, 'info' was defined at line 58 in original. I am inserting before line 58 (implied).
	// Let's make sure we have 'info' available or move definition.
	// Actually, let's keep the flow linear.

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
		// Skip Trigger Nodes (they are the entry point, already "executed")
		if node.Type == "api-trigger" || node.Type == "manual-trigger" || node.Type == "webhook" {
			continue
		}

		// Construct Context for the Node
		nodeCtx := nodes.NodeContext{
			FlowID:     flowDefinition.ID,
			WorkflowID: workflow.GetInfo(ctx).WorkflowExecution.ID,
			StepID:     node.ID,
			InputData: map[string]interface{}{
				"steps":     executionState,
				"variables": variables,
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
			// Wait for a Signal
			// Signal name convention: "Resume-<NodeID>" or "HumanTask-<TaskID>"
			signalName := "Resume-" + node.ID

			// If the node returned a task_id (Human Task), listen to that specific task signal
			if tid, ok := result.Output["task_id"].(string); ok {
				signalName = "HumanTask-" + tid
			}
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

		// If this was a Set Variable node, update the global variables state
		if node.Type == "set" || node.Type == "variable" {
			for k, v := range result.Output {
				// Avoid pollution from debug keys
				if k != "_debug_message" && k != "_received_config" {
					variables[k] = v
				}
			}
		}
	}

	logger.Info("Nodal workflow completed successfully")
	return executionState, nil
}
