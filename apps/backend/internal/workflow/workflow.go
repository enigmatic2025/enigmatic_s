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
	// REFACTORED: We now use a Graph Walker approach to support loops/jumps.
	// The walker starts at the Trigger node and follows edges dynamically.
	// sortedNodes, err := TopologicalSort(flowDefinition)
	// if err != nil {
	// 	logger.Error("Graph sort failed", "Error", err)
	// 	return nil, err
	// }

	// 0. Initialize Execution State
	executionState := make(map[string]map[string]interface{})
	variables := make(map[string]interface{}) // Global variables state

	// Initialize 'trigger' scope with input data (standard convention)
	executionState["trigger"] = map[string]interface{}{
		"body": inputData,
	}

	// 1. Find API Trigger Node configuration for Templating AND pre-populate node output
	var titleTemplate, descTemplate string
	var infoFieldsRaw []interface{}
	priority := "medium"                     // Default
	var assignments []map[string]interface{} // Default empty

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

			if val, ok := inputData["info_fields"]; ok {
				// Type assertion complex, simplified:
				// infoFields = val
				_ = val
			}

			// 1.3 Determine Assignments (Input > Trigger Config > Default Empty)
			// Assignments declared outside loop
			if val, ok := inputData["assignments"]; ok {
				// Try to parse from input
				if list, ok := val.([]interface{}); ok {
					for _, item := range list {
						if m, ok := item.(map[string]interface{}); ok {
							assignments = append(assignments, map[string]interface{}{
								"id":     m["id"],
								"type":   m["type"],
								"name":   m["name"],
								"avatar": m["avatar"],
								"info":   m["info"],
							})
						}
					}
				}
			} else {
				// Check trigger config for default assignments (using 'node' variable)
				if def, ok := node.Data["assignments"]; ok {
					if list, ok := def.([]interface{}); ok {
						for _, item := range list {
							if m, ok := item.(map[string]interface{}); ok {
								assignments = append(assignments, map[string]interface{}{
									"id":     m["id"],
									"type":   m["type"],
									"name":   m["name"],
									"avatar": m["avatar"],
									"info":   m["info"],
								})
							}
						}
					}
				}
			}

			// 2. Add System Info
			// Add Execution Info
			if fields, ok := node.Data["infoFields"].([]interface{}); ok {
				infoFieldsRaw = fields
			}

			// Priority Logic
			// 1. Config Default
			if p, ok := node.Data["defaultPriority"].(string); ok && p != "" {
				priority = p
			}
			// 2. API Override (if "priority" is in top-level input)
			if p, ok := inputData["priority"].(string); ok && p != "" {
				priority = p
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

	// Debug keys
	keys := make([]string, 0, len(executionState))
	for k := range executionState {
		keys = append(keys, k)
	}
	logger.Info("Evaluation Context Ready", "AvailableSteps", keys)

	if titleTemplate != "" {
		if val, err := expressionEngine.Evaluate(titleTemplate, evalCtx); err == nil {
			titleTemplate = fmt.Sprintf("%v", val)
		} else {
			logger.Error("Title Template Eval Failed", "Error", err, "Template", titleTemplate)
		}
	}
	// Note: We intentionally don't evaluate Description here fully if it's meant to be static,
	// but if user wants dynamic descriptions (e.g. "Order #123"), we should support it.
	// Users requested decoupling, so description might be static info.
	// However, evaluating it enables "Order #{{id}} details". Let's evaluate it too.
	if descTemplate != "" {
		if val, err := expressionEngine.Evaluate(descTemplate, evalCtx); err == nil {
			descTemplate = fmt.Sprintf("%v", val)
		} else {
			logger.Error("Description Template Eval Failed", "Error", err, "Template", descTemplate)
		}
	}

	var infoFields []map[string]string
	if len(infoFieldsRaw) > 0 {
		infoFields = make([]map[string]string, 0, len(infoFieldsRaw))
		for _, raw := range infoFieldsRaw {
			if fieldMap, ok := raw.(map[string]interface{}); ok {
				label, _ := fieldMap["label"].(string)
				valueTpl, _ := fieldMap["value"].(string)

				// Evaluate value template
				evaluatedValue := valueTpl
				if val, err := expressionEngine.Evaluate(valueTpl, evalCtx); err == nil {
					evaluatedValue = fmt.Sprintf("%v", val)
				}

				infoFields = append(infoFields, map[string]string{
					"label": label,
					"value": evaluatedValue,
				})
			}
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
		Priority:    priority,
		Assignments: assignments,
		InfoFields:  infoFields,
	}

	if err := workflow.ExecuteActivity(ctx, RecordActionFlowActivity, recordParams).Get(ctx, nil); err != nil {
		logger.Error("Failed to record action flow", "Error", err)
		return nil, err // Stop execution if we can't record the start
	}

	// 2. Build Adjacency Map (Actually unused now, we scan edges directly)
	// adj := make(map[string][]string)
	// Re-map flow definition nodes to a quick lookup
	// Re-map flow definition nodes to a quick lookup
	nodesLookup := make(map[string]Node)

	// Let's use the incoming flowDefinition direct
	for _, n := range flowDefinition.Nodes {
		nodesLookup[n.ID] = n
	}

	// 2. Build Adjacency Map (Actually unused now, we scan edges directly)
	// adj := make(map[string][]string)
	// Re-map flow definition nodes to a quick lookup
	// Re-map flow definition nodes to a quick lookup

	// 3. Find Start Nodes (Trigger)
	var queue []string
	for _, node := range flowDefinition.Nodes {
		if node.Type == "api-trigger" || node.Type == "manual-trigger" || node.Type == "webhook" || node.Type == "trigger" {
			queue = append(queue, node.ID)
		}
	}

	if len(queue) == 0 {
		return nil, fmt.Errorf("no trigger node found")
	}

	// We only support single-threaded execution for now (one active pointer)
	// Start with the first trigger
	currentNodeID := queue[0]

	// Max steps safety to prevent infinite loops crashing the worker
	maxSteps := 1000
	stepsExecuted := 0

	// Execution Loop (Graph Walker)
	for currentNodeID != "" {
		stepsExecuted++
		if stepsExecuted > maxSteps {
			return nil, fmt.Errorf("read max execution steps (%d) - potential infinite loop without exit condition", maxSteps)
		}

		node, exists := nodesLookup[currentNodeID]
		if !exists {
			logger.Error("Attempted to execute non-existent node", "ID", currentNodeID)
			break
		}

		// Skip Trigger Nodes logic here as they are entry points?
		// Actually, we might want to "execute" them if they have logic, but usually they just pass data.
		// If it's the very first step, we assume data is already in executionState["trigger"]
		if stepsExecuted == 1 && (node.Type == "api-trigger" || node.Type == "manual-trigger" || node.Type == "trigger") {
			// Already processed initialization above
			// Just move to next
			// We need to advance currentNodeID here because the 'else' block which usually advances it is skipped.
			// Oh wait, advancement is at the bottom of the loop.
			// But we need to make sure we don't run the `NodeExecutionActivity` for triggers.
		} else {

			// Construct Context for the Node
			nodeCtx := nodes.NodeContext{
				FlowID:     flowDefinition.ID,
				WorkflowID: workflow.GetInfo(ctx).WorkflowExecution.ID,
				RunID:      workflow.GetInfo(ctx).WorkflowExecution.RunID,
				StepID:     node.ID,
				InputData: map[string]interface{}{
					"steps":     executionState,
					"variables": variables,
				},
				Config: node.Data,
			}

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
				signalName := "Resume-" + node.ID
				if tid, ok := result.Output["task_id"].(string); ok {
					signalName = "HumanTask-" + tid
				}
				var signalData interface{}
				selector := workflow.NewSelector(ctx)
				selector.AddReceive(workflow.GetSignalChannel(ctx, signalName), func(c workflow.ReceiveChannel, more bool) {
					c.Receive(ctx, &signalData)
				})
				selector.Select(ctx)
				logger.Info("Signal received, resuming", "ID", node.ID, "Data", signalData)
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

			// Store output
			executionState[node.ID] = result.Output

			// Update variables
			if node.Type == "set" || node.Type == "variable" {
				for k, v := range result.Output {
					if k != "_debug_message" && k != "_received_config" {
						variables[k] = v
					}
				}
			}

			// CHECK FOR GOTO / JUMP SIGNAL
			if target, ok := result.Output["_goto_target"].(string); ok && target != "" {
				logger.Info("Jumping to target node", "From", node.ID, "To", target)
				currentNodeID = target
				continue // Jump immediately
			}

			// Determine Next Node (BRANCHING LOGIC)
			outgoingID := ""

			// Get all edges from this node
			// Note: adj map only stores targets, we need full edge objects for handles.
			// Loop through all edges is inefficient but fine for MVP graph sizes.
			outgoingEdges := make([]Edge, 0)
			for _, edge := range flowDefinition.Edges {
				if edge.Source == currentNodeID {
					outgoingEdges = append(outgoingEdges, edge)
				}
			}

			if len(outgoingEdges) == 0 {
				// Stop if no edges
				currentNodeID = ""
				// Loop will exit on next check or we can break here
				// break // Don't break, let the outer loop handle "currentNodeID == empty"
			} else {
				// LOGIC: Branching based on Node Type
				if node.Type == "condition" || node.Type == "if-else" {
					// Expecting boolean result
					resVal, _ := result.Output["result"].(bool)

					// Find edge matching handle
					// Convention: Handle for true is "true", false is "false"
					targetHandle := "false"
					if resVal {
						targetHandle = "true"
					}

					for _, edge := range outgoingEdges {
						if edge.SourceHandle != nil && *edge.SourceHandle == targetHandle {
							outgoingID = edge.Target
							break
						}
					}

					if outgoingID == "" && len(outgoingEdges) > 0 {
						logger.Warn("Condition node has no matching edge for result", "Result", targetHandle)
					}

				} else if node.Type == "switch" {
					// Expecting "selected_case" in output
					selectedCase, _ := result.Output["selected_case"].(string)

					for _, edge := range outgoingEdges {
						if edge.SourceHandle != nil && *edge.SourceHandle == selectedCase {
							outgoingID = edge.Target
							break
						}
					}
					if outgoingID == "" {
						// Try finding "default" handle
						for _, edge := range outgoingEdges {
							if edge.SourceHandle != nil && *edge.SourceHandle == "default" {
								outgoingID = edge.Target
								break
							}
						}
					}

				} else {
					// Standard Node (Linear): Just take the first edge
					if len(outgoingEdges) > 0 {
						outgoingID = outgoingEdges[0].Target
					}
				}

				currentNodeID = outgoingID
			}
		}
	}

	logger.Info("Nodal workflow completed successfully")
	return executionState, nil
}
