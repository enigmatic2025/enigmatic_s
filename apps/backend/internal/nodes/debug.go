package nodes

import (
	"context"
	"fmt"
)

// DebugNode is a utility node that logs its input and config to stdout.
// It is useful for verifying that the workflow engine is passing data correctly.
type DebugNode struct{}

// Execute prints the node context and returns the input data as output.
func (n *DebugNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	fmt.Printf("[DEBUG NODE] Workflow: %s, Step: %s\n", input.WorkflowID, input.StepID)
	fmt.Printf("[DEBUG NODE] Input: %+v\n", input.InputData)
	fmt.Printf("[DEBUG NODE] Config: %+v\n", input.Config)

	return &NodeResult{
		Status: "SUCCESS",
		Output: input.InputData, // Pass through input as output
	}, nil
}
