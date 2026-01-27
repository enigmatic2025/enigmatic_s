package nodes

import (
	"context"
	"fmt"
	"strings"
)

// NodeContext contains all the data available to the node during execution.
type NodeContext struct {
	FlowID     string
	WorkflowID string
	RunID      string
	StepID     string
	InputData  map[string]interface{}
	Config     map[string]interface{}
}

// NodeResult is the output of a node execution.
type NodeResult struct {
	Status string                 // "SUCCESS", "FAILED", "PAUSED"
	Output map[string]interface{} // The data produced by this node
	Error  string                 // Serialized error message
}

const (
	StatusSuccess = "SUCCESS"
	StatusFailed  = "FAILED"
	StatusPaused  = "PAUSED"
)

// NodeExecutor is the interface that all node types must implement.
type NodeExecutor interface {
	Execute(ctx context.Context, input NodeContext) (*NodeResult, error)
}

// Registry is the global map of all available node types.
// It maps the node type string (e.g., "SET") to its corresponding NodeExecutor implementation.
var Registry = map[string]NodeExecutor{
	"DEBUG":       &DebugNode{},
	"SET":         &SetNode{},
	"VARIABLE":    &SetNode{}, // Alias for SetNode
	"CONDITION":   &ConditionNode{},
	"MAP":         &MapNode{},
	"HTTP":        &HttpNode{},
	"PARSE":       &ParseNode{},
	"APPROVAL":    &ApprovalNode{},
	"SCHEDULE":    &ScheduleNode{},
	"LOOP":        &LoopNode{},
	"SWITCH":      &SwitchNode{},
	"FILTER":      &FilterNode{},
	"EMAIL":       &EmailNode{},
	"TRIGGER":     &TriggerNode{},
	"API-TRIGGER": &TriggerNode{}, // Support for API Trigger node type
	"ACTION":      &HttpNode{},    // Alias for generic Action nodes (defaults to HTTP)
	"HUMAN-TASK":  &HumanTaskNode{},
}

// GetExecutor returns the executor for a given node type.
// It returns an error if the node type is not found in the Registry.
// GetExecutor returns the executor for a given node type.
// It returns an error if the node type is not found in the Registry.
func GetExecutor(nodeType string, config map[string]interface{}) (NodeExecutor, error) {
	nodeType = strings.ToUpper(nodeType)

	// Dispatch Generic ACTION type based on subtype
	if nodeType == "ACTION" {
		if subtype, ok := config["subtype"].(string); ok && subtype != "" {
			nodeType = strings.ToUpper(subtype)
		} else {
			// Default to HTTP if no subtype (legacy/base action)
			nodeType = "HTTP"
		}
	}

	executor, ok := Registry[nodeType]
	if !ok {
		return nil, fmt.Errorf("unknown node type: %s", nodeType)
	}
	return executor, nil
}
