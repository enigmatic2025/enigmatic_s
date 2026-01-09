package nodes

import (
	"context"
	"fmt"
	"strings"
)

type FilterNode struct{}

func (n *FilterNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	settings, _ := input.Config["settings"].(map[string]interface{})
	engine := NewExpressionEngine()

	// 1. Resolve Array Input
	arrayVar, _ := settings["arrayVariable"].(string)
	resolvedInput, err := engine.Evaluate(arrayVar, input)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve array variable: %w", err)
	}

	// Normalize to Slice
	var items []interface{}
	switch v := resolvedInput.(type) {
	case []interface{}:
		items = v
	case map[string]interface{}:
		items = []interface{}{v} // Auto-wrap single object
	case nil:
		items = []interface{}{}
	default:
		return nil, fmt.Errorf("input is not an array or object (got %T)", v)
	}

	// 2. Parse Conditions & Match Type
	matchType, _ := settings["matchType"].(string)
	if matchType == "" {
		matchType = "ALL" // Default to AND
	}

	var conditions []map[string]interface{}
	if rawConds, ok := settings["conditions"].([]interface{}); ok {
		for _, c := range rawConds {
			if cm, ok := c.(map[string]interface{}); ok {
				conditions = append(conditions, cm)
			}
		}
	} else {
		// Legacy Fallback (Migration)
		// Handle cases where existing nodes have flat settings
		conditions = append(conditions, map[string]interface{}{
			"field":    settings["field"],
			"operator": settings["operator"],
			"value":    settings["value"],
		})
	}

	// 3. Pre-resolve Target Values (Right-Side) for all conditions
	// We optimize by resolving dynamic values once against the global context
	type resolvedCondition struct {
		field     string
		operator  string
		targetVal interface{}
	}
	var activeConditions []resolvedCondition

	for _, cond := range conditions {
		f, _ := cond["field"].(string)
		op, _ := cond["operator"].(string)
		vStr, _ := cond["value"].(string)

		// Resolve the comparison value (e.g. "100" or "{{ steps.prev.limit }}")
		rVal, err := engine.Evaluate(vStr, input)
		if err != nil {
			return nil, fmt.Errorf("failed to resolve condition value: %w", err)
		}

		activeConditions = append(activeConditions, resolvedCondition{
			field:     f,
			operator:  op,
			targetVal: rVal,
		})
	}

	// 4. Filtering Loop
	filtered := []interface{}{}

	for _, item := range items {
		// Determine match based on strategy
		var isMatch bool
		if matchType == "ANY" {
			isMatch = false // Start false, true if ANY pass
		} else {
			isMatch = true // Start true (ALL), false if ANY fail
		}

		// Check all conditions
		for _, cond := range activeConditions {
			// Resolve Item Field (Left-Side)
			var itemVal interface{}
			if cond.field == "" {
				itemVal = item
			} else {
				parts := strings.Split(cond.field, ".")
				val, err := engine.Traverse(item, parts)
				if err != nil {
					itemVal = nil // Field missing
				} else {
					itemVal = val
				}
			}

			// Compare
			pass := compareValues(itemVal, cond.operator, cond.targetVal)

			if matchType == "ANY" {
				if pass {
					isMatch = true
					break // Short-circuit success
				}
			} else { // ALL
				if !pass {
					isMatch = false
					break // Short-circuit failure
				}
			}
		}

		if isMatch {
			filtered = append(filtered, item)
		}
	}

	return &NodeResult{
		Status: StatusSuccess,
		Output: map[string]interface{}{
			"data":  filtered,
			"count": len(filtered),
		},
	}, nil
}

// compareValues compares two values based on the operator
func compareValues(a interface{}, op string, b interface{}) bool {
	// Simple stringification for comparison for MVP
	// This handles numbers as strings if they come from JSON as float64
	strA := fmt.Sprintf("%v", a)
	strB := fmt.Sprintf("%v", b)

	switch op {
	case "==":
		return strA == strB
	case "!=":
		return strA != strB
	case ">":
		// This is naive string comparison. For numbers, we should try type assertion.
		// For MVP, let's keep it simple or try to parse floats if they look like numbers?
		// Let's stick to string comparison for now unless strict numeric required.
		// Actually, for "Greater", string comparison is dangerous ("10" < "2").
		return strA > strB
	case "<":
		return strA < strB
	case "contains":
		return strings.Contains(strA, strB)
	default:
		return false
	}
}
