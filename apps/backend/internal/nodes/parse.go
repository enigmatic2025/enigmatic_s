package nodes

import (
	"context"
	"encoding/json"
	"fmt"
)

type ParseNode struct{}

func (n *ParseNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// We enforce JSON only now, so we don't even check format really, 
	// but let's keep it clean.
	source, _ := input.Config["source"].(string)

	// If source is not explicitly configured, try to find it in the input data
	if source == "" {
		// Common pattern: HTTP node outputs "body"
		if body, ok := input.InputData["body"].(string); ok {
			source = body
		} else if data, ok := input.InputData["data"].(string); ok {
			source = data
		} else {
			if len(input.InputData) == 0 {
				return nil, fmt.Errorf("no source data provided")
			}
			return nil, fmt.Errorf("could not determine source data from input (expected 'body' or 'data' field)")
		}
	}

	var output interface{}
	err := json.Unmarshal([]byte(source), &output)

	if err != nil {
		return &NodeResult{
			Status: "FAILED",
			Output: map[string]interface{}{"error": err.Error()},
		}, nil
	}

	return &NodeResult{
		Status: "SUCCESS",
		Output: map[string]interface{}{"data": output},
	}, nil
}
