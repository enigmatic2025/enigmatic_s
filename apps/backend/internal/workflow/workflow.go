package workflow

import (
	"fmt"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/nodes"
	"go.temporal.io/sdk/workflow"
)

// NodalWorkflow executes a graph of nodes with support for parallel execution and smart merges
func NodalWorkflow(ctx workflow.Context, flowDefinition FlowDefinition, inputData map[string]interface{}) (interface{}, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 1 * time.Minute, // Default timeout
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	logger := workflow.GetLogger(ctx)
	logger.Info("Nodal workflow started (Parallel Engine)", "Nodes", len(flowDefinition.Nodes))

	// 0. Initialize State
	// We use a map to track the status of each node: "PENDING", "RUNNING", "COMPLETED", "FAILED"
	nodeStatus := make(map[string]string)
	executionState := make(map[string]map[string]interface{})
	variables := make(map[string]interface{})

	// Initialize 'trigger' scope
	executionState["trigger"] = map[string]interface{}{
		"body": inputData,
	}

	// 1. Build Graph & Lookup Maps
	nodesLookup := make(map[string]Node)
	incomingEdges := make(map[string][]Edge)
	outgoingEdges := make(map[string][]Edge)

	for _, n := range flowDefinition.Nodes {
		nodesLookup[n.ID] = n
		nodeStatus[n.ID] = "PENDING"
		// Optimization: Pre-fill API trigger data
		if n.Type == "api-trigger" || n.Type == "manual-trigger" || n.Type == "webhook" {
			executionState[n.ID] = inputData
		}
	}

	for _, e := range flowDefinition.Edges {
		outgoingEdges[e.Source] = append(outgoingEdges[e.Source], e)
		incomingEdges[e.Target] = append(incomingEdges[e.Target], e)
	}

	// 2. Prepare Template Variables & Record Start
	// (Keeping the original logic for recording the workflow start)
	var titleTemplate, descTemplate string
	var infoFieldsRaw []interface{}
	priority := "medium"
	var assignments []map[string]interface{}

	// Locate Trigger Node for Config
	var triggerNodeID string
	for _, n := range flowDefinition.Nodes {
		if n.Type == "api-trigger" || n.Type == "manual-trigger" || n.Type == "webhook" || n.Type == "trigger" {
			triggerNodeID = n.ID
			// Extract config (same as before)
			if n.Type == "api-trigger" {
				if t, ok := n.Data["instanceNameTemplate"].(string); ok {
					titleTemplate = t
				}
				if d, ok := n.Data["instanceDescriptionTemplate"].(string); ok {
					descTemplate = d
				} else if d, ok := n.Data["description"].(string); ok {
					descTemplate = d
				}
				if val, ok := inputData["assignments"]; ok {
					if list, ok := val.([]interface{}); ok {
						for _, item := range list {
							if m, ok := item.(map[string]interface{}); ok {
								assignments = append(assignments, map[string]interface{}{
									"id": m["id"], "type": m["type"], "name": m["name"], "avatar": m["avatar"], "info": m["info"],
								})
							}
						}
					}
				} else if def, ok := n.Data["assignments"]; ok {
					if list, ok := def.([]interface{}); ok {
						for _, item := range list {
							if m, ok := item.(map[string]interface{}); ok {
								assignments = append(assignments, map[string]interface{}{
									"id": m["id"], "type": m["type"], "name": m["name"], "avatar": m["avatar"], "info": m["info"],
								})
							}
						}
					}
				}
				if fields, ok := n.Data["infoFields"].([]interface{}); ok {
					infoFieldsRaw = fields
				}
				if p, ok := n.Data["defaultPriority"].(string); ok && p != "" {
					priority = p
				}
			}
			break
		}
	}

	// Evaluate Templates
	info := workflow.GetInfo(ctx)
	expressionEngine := nodes.NewExpressionEngine()
	evalCtx := nodes.NodeContext{
		FlowID:     flowDefinition.ID,
		WorkflowID: info.WorkflowExecution.ID,
		InputData: map[string]interface{}{
			"steps":     executionState,
			"variables": variables,
			"input":     inputData,
		},
	}

	if titleTemplate != "" {
		if val, err := expressionEngine.Evaluate(titleTemplate, evalCtx); err == nil {
			titleTemplate = fmt.Sprintf("%v", val)
		}
	}
	if descTemplate != "" {
		if val, err := expressionEngine.Evaluate(descTemplate, evalCtx); err == nil {
			descTemplate = fmt.Sprintf("%v", val)
		}
	}

	var infoFields []map[string]string
	if len(infoFieldsRaw) > 0 {
		infoFields = make([]map[string]string, 0, len(infoFieldsRaw))
		for _, raw := range infoFieldsRaw {
			if fieldMap, ok := raw.(map[string]interface{}); ok {
				label, _ := fieldMap["label"].(string)
				valueTpl, _ := fieldMap["value"].(string)
				evaluatedValue := valueTpl
				if val, err := expressionEngine.Evaluate(valueTpl, evalCtx); err == nil {
					evaluatedValue = fmt.Sprintf("%v", val)
				}
				infoFields = append(infoFields, map[string]string{"label": label, "value": evaluatedValue})
			}
		}
	}

	// Record Execution in DB
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
		return nil, err
	}

	// 3. Parallel Execution Engine
	// We use a WaitGroup to wait for all branches to finish
	wg := workflow.NewWaitGroup(ctx)
	// We assume at least the trigger node starts
	wg.Add(1)

	// executionError handles failing the whole workflow if one node fails
	var executionError error

	// Helper: Try to execute a node
	// This function is RECURSIVE (via workflow.Go)
	var tryExecuteNode func(ctx workflow.Context, nodeID string)
	tryExecuteNode = func(ctx workflow.Context, nodeID string) {
		defer wg.Done()

		// Safety check
		if executionError != nil {
			return
		}

		// A. Check Status
		// In Temporal's single-threaded event loop, this is safe without locks
		if nodeStatus[nodeID] == "COMPLETED" || nodeStatus[nodeID] == "RUNNING" {
			return
		}

		// B. Dependency Check (Smart Merge)
		// "Are ALL my parents completed?"
		parents := incomingEdges[nodeID]
		for _, edge := range parents {
			parentStatus := nodeStatus[edge.Source]
			if parentStatus != "COMPLETED" {
				// Dependency not met yet. Wait.
				// When the missing parent finishes, it will trigger this node again.
				return
			}
		}

		// C. Execute Node
		nodeStatus[nodeID] = "RUNNING"
		node, exists := nodesLookup[nodeID]
		if !exists {
			logger.Error("Node not found", "ID", nodeID)
			return
		}

		// Special case for Trigger: It's technically already "Done" as it triggered the flow
		// But if it has logic, we run it. Usually Triggers just pass data.
		// For simplicity, we treat Trigger as an immediate success if it was the entry point.

		var result nodes.NodeResult

		// Skip execution for triggers, just mark success as we did init above
		isTrigger := node.Type == "api-trigger" || node.Type == "manual-trigger" || node.Type == "webhook" || node.Type == "trigger"

		if isTrigger {
			result = nodes.NodeResult{Status: nodes.StatusSuccess, Output: executionState[nodeID]}
		} else {
			// Prepare Context
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

			logger.Info("Executing Node", "ID", node.ID, "Type", node.Type)
			err := workflow.ExecuteActivity(ctx, NodeExecutionActivity, nodeCtx).Get(ctx, &result)
			if err != nil {
				logger.Error("Node execution failed", "ID", node.ID, "Error", err)
				executionError = err
				nodeStatus[nodeID] = "FAILED"
				return
			}
		}

		// D. Handle Result (Pause/Resume)
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
			selector.Select(ctx) // Blocking wait for signal

			// Update result
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
			executionError = fmt.Errorf("node %s failed: %s", node.ID, result.Error)
			nodeStatus[nodeID] = "FAILED"
			return
		}

		// Save State
		executionState[node.ID] = result.Output
		nodeStatus[nodeID] = "COMPLETED"
		if node.Type == "set" || node.Type == "variable" {
			for k, v := range result.Output {
				if k != "_debug_message" {
					variables[k] = v
				}
			}
		}

		// E. Trigger Children (Parallel Split)
		childrenEdges := outgoingEdges[nodeID]
		for _, edge := range childrenEdges {
			// Branching Logic (Condition / Switch)
			// If node is a conditional, we only trigger specific children
			shouldTrigger := true

			if node.Type == "condition" || node.Type == "if-else" {
				resVal, _ := result.Output["result"].(bool)
				targetHandle := "false"
				if resVal {
					targetHandle = "true"
				}

				// Only follow edge if handle matches
				if edge.SourceHandle != nil && *edge.SourceHandle != targetHandle {
					shouldTrigger = false
				}
			} else if node.Type == "switch" {
				selectedCase, _ := result.Output["selected_case"].(string)
				// 1. Exact match
				// 2. Default if no exact match (simplified: just check handle)
				if edge.SourceHandle != nil && *edge.SourceHandle != selectedCase {
					// Check if it's default? Complex.
					// For MVP, strict match or "default" if selectedCase is empty/unmatched?
					// Let's stick to strict match for now.
					if *edge.SourceHandle != "default" {
						shouldTrigger = false
					}
					// If selectedCase matched a different handle, we shouldn't trigger default
					// This logic usually requires knowing *all* edges to decide if default runs.
					// For now: Simple switch.
				}
			}

			if shouldTrigger {
				wg.Add(1)
				// Launch child in new routine
				workflow.Go(ctx, func(ctx workflow.Context) {
					tryExecuteNode(ctx, edge.Target)
				})
			}
		}
	}

	// 4. Kickoff
	if triggerNodeID == "" {
		return nil, fmt.Errorf("no trigger node found")
	}

	// Start from trigger
	workflow.Go(ctx, func(ctx workflow.Context) {
		tryExecuteNode(ctx, triggerNodeID)
	})

	// Wait for all to finish
	wg.Wait(ctx)

	if executionError != nil {
		return nil, executionError
	}

	logger.Info("Nodal workflow completed successfully")
	return executionState, nil
}
