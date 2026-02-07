package nodes

import (
	"context"
	"fmt"
	"strings"
)

// ConditionNode evaluates a boolean condition.
// Config expects a "result" boolean (for MVP) or an expression string.
type ConditionNode struct{}

// Execute evaluates the condition and returns the result.
func (n *ConditionNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// Config should contain "expression" or "conditions"
	// For this MVP, we'll check a simple boolean field in config "result"
	// In reality, this would use an expression engine.

	// 1. Initialize Expression Engine
	// 1. Initialize Expression Engine
	expressionEngine := NewExpressionEngine()

	// Extract "condition" object from config
	// Format: { "condition": { "left": "...", "operator": "==", "right": "..." } }
	condMap, ok := input.Config["condition"].(map[string]interface{})
	if !ok {
		// Fallback: Default directly in root?
		fmt.Printf("DEBUG: ConditionNode - Missing 'condition' config block, defaulting to true\n")
		return &NodeResult{Status: StatusSuccess, Output: map[string]interface{}{"result": true}}, nil
	}

	rawLeft, _ := condMap["left"].(string)
	operator, _ := condMap["operator"].(string)
	rawRight, _ := condMap["right"].(string)

	fmt.Printf("DEBUG: Condition Eval: '%s' %s '%s'\n", rawLeft, operator, rawRight)

	// 2. Evaluate Expressions
	valLeft, err := expressionEngine.Evaluate(rawLeft, input)
	if err != nil {
		fmt.Printf("DEBUG: Condition Left Eval Error: %v\n", err)
		valLeft = rawLeft // Fallback to raw string
	}

	valRight, err := expressionEngine.Evaluate(rawRight, input)
	if err != nil {
		fmt.Printf("DEBUG: Condition Right Eval Error: %v\n", err)
		valRight = rawRight
	}

	// 3. Compare
	result := compareValuesGeneric(valLeft, valRight, operator)
	fmt.Printf("DEBUG: Condition Result: %v (Left: %v, Right: %v)\n", result, valLeft, valRight)

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"result": result,
		},
		Error: "",
	}, nil
}

func compareValuesGeneric(a, b interface{}, op string) bool {
	// 1. Try Numeric Comparison
	fA, okA := toFloat(a)
	fB, okB := toFloat(b)

	if okA && okB {
		switch op {
		case "==", "=":
			return fA == fB
		case "!=":
			return fA != fB
		case ">":
			return fA > fB
		case "<":
			return fA < fB
		case ">=":
			return fA >= fB
		case "<=":
			return fA <= fB
		}
	}

	// 2. String Comparison
	sA := fmt.Sprintf("%v", a)
	sB := fmt.Sprintf("%v", b)

	switch op {
	case "==", "=":
		return sA == sB
	case "!=":
		return sA != sB
	case "contains":
		return strings.Contains(sA, sB)
		// Add Regex match if needed
	}

	return false
}

func toFloat(v interface{}) (float64, bool) {
	if v == nil {
		return 0, false
	}
	switch val := v.(type) {
	case int:
		return float64(val), true
	case int64:
		return float64(val), true
	case float64:
		return val, true
	case bool:
		if val {
			return 1.0, true
		}
		return 0.0, true
	case string:
		var f float64
		if _, err := fmt.Sscanf(val, "%f", &f); err == nil {
			return f, true
		}
		// Handle "true"/"false" strings
		lower := strings.ToLower(val)
		if lower == "true" {
			return 1.0, true
		}
		if lower == "false" {
			return 0.0, true
		}
	}
	return 0, false
}
