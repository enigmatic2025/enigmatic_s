package nodes

import (
	"context"
	"fmt"
	"strings"
)

// NodeContext contains all the data available to the node during execution.
type NodeContext struct {
	WorkflowID string
	StepID     string
	InputData  map[string]interface{}
	Config     map[string]interface{}
}

// NodeResult is the output of a node execution.
type NodeResult struct {
	Status string                 // "SUCCESS", "FAILED", "PAUSED"
	Output map[string]interface{} // The data produced by this node
	Error  error
}

// NodeExecutor is the interface that all node types must implement.
type NodeExecutor interface {
	Execute(ctx context.Context, input NodeContext) (*NodeResult, error)
}

// Registry is the global map of all available node types.
// It maps the node type string (e.g., "SET") to its corresponding NodeExecutor implementation.
var Registry = map[string]NodeExecutor{
	"DEBUG":     &DebugNode{},
	"SET":       &SetNode{},
	"CONDITION": &ConditionNode{},
	"MAP":       &MapNode{},
	"HTTP":      &HttpNode{},
}

// GetExecutor returns the executor for a given node type.
// It returns an error if the node type is not found in the Registry.
func GetExecutor(nodeType string) (NodeExecutor, error) {
	nodeType = strings.ToUpper(nodeType)
	executor, ok := Registry[nodeType]
	if !ok {
		return nil, fmt.Errorf("unknown node type: %s", nodeType)
	}
	return executor, nil
}
