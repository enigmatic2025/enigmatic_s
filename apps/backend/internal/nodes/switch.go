package nodes

import (
	"context"
	"fmt"
	"strings"
)

type SwitchNode struct{}

func (n *SwitchNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	expressionEngine := NewExpressionEngine()

	// Evaluate the switch variable expression
	variable, _ := input.Config["variable"].(string)
	if variable == "" {
		return &NodeResult{
			Status: StatusSuccess,
			Output: map[string]interface{}{
				"selected_case": "default",
				"value":         nil,
			},
		}, nil
	}

	evaluated, err := expressionEngine.Evaluate(variable, input)
	if err != nil {
		fmt.Printf("DEBUG: Switch variable eval error: %v\n", err)
		evaluated = variable // Fallback to raw string
	}

	evaluatedStr := fmt.Sprintf("%v", evaluated)
	fmt.Printf("DEBUG: Switch evaluated variable '%s' → '%s'\n", variable, evaluatedStr)

	// Check cases for a match
	selectedCase := "default"
	casesRaw, _ := input.Config["cases"].([]interface{})

	for _, c := range casesRaw {
		caseMap, ok := c.(map[string]interface{})
		if !ok {
			continue
		}
		caseID, _ := caseMap["id"].(string)
		caseLabel, _ := caseMap["label"].(string)
		caseValue := caseLabel // Use label as the comparison value

		// Allow explicit value override if present
		if v, ok := caseMap["value"].(string); ok && v != "" {
			caseValue = v
		}

		// Compare: case-insensitive string match
		if strings.EqualFold(evaluatedStr, caseValue) {
			selectedCase = caseID
			fmt.Printf("DEBUG: Switch matched case '%s' (id: %s)\n", caseLabel, caseID)
			break
		}
	}

	if selectedCase == "default" {
		fmt.Printf("DEBUG: Switch fell through to default\n")
	}

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"selected_case": selectedCase,
			"value":         evaluated,
		},
	}, nil
}
