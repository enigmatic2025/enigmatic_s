package nodes

import (
	"context"
	"fmt"
)

type ApprovalNode struct{}

func (n *ApprovalNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// In a real system, this would send an email or Slack notification
	// telling the user that an approval is needed.

	// Check if we already have approval data (re-entry)?
	// Actually, usually the Signal contains the data, and the Activity just initiates the request.

	fmt.Printf("SUSPENDING Workflow %s for Approval Step %s\n", input.WorkflowID, input.StepID)

	return &NodeResult{
		Status: StatusPaused,
		Output: nil, // Waiting for input
		Error:  "",
	}, nil
}
