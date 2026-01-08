package nodes

import (
	"context"
)

type EmailNode struct{}

func (n *EmailNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Stub implementation for Email
	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"message": "Email sent (Stub)",
			"to":      input.Config["to"],
		},
	}, nil
}
