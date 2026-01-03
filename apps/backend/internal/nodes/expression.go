package nodes

import (
	"fmt"
	"regexp"
	"strings"
)

// ExpressionEngine resolves expressions like {{ steps.foo.data.bar }}
type ExpressionEngine struct{}

// NewExpressionEngine creates a new instance
func NewExpressionEngine() *ExpressionEngine {
	return &ExpressionEngine{}
}

// Evaluate resolves string expressions against the context.
// It supports basic string interpolation: "Hello {{ steps.name.input.value }}"
func (e *ExpressionEngine) Evaluate(expression string, ctx NodeContext) (interface{}, error) {
	// optimistically check if it contains {{
	if !strings.Contains(expression, "{{") {
		return expression, nil
	}

	// Regex to find {{ ... }}
	// We use a non-greedy match (.*?)
	re := regexp.MustCompile(`\{\{\s*(.*?)\s*\}\}`)

	// ReplaceAllStringFunc lets us handle each match
	var err error
	result := re.ReplaceAllStringFunc(expression, func(match string) string {
		// match is like "{{ steps.foo.data }}"
		// content is like "steps.foo.data"
		content := re.FindStringSubmatch(match)[1]
		val, evalErr := e.resolvePath(content, ctx)
		if evalErr != nil {
			err = evalErr // Capture error
			return match  // Return original on error (or empty string?) - preventing crash
		}
		return fmt.Sprintf("%v", val)
	})

	if err != nil {
		return nil, err
	}

	return result, nil
}

// resolvePath traverses the NodeContext based on dot notation
// Path examples:
// - steps.Trigger.input.foo
// - variables.API_KEY
func (e *ExpressionEngine) resolvePath(path string, ctx NodeContext) (interface{}, error) {
	parts := strings.Split(path, ".")
	if len(parts) == 0 {
		return nil, fmt.Errorf("empty path")
	}

	root := parts[0]
	var current interface{}

	// 1. Determine Root Object
	switch root {
	case "steps":
		// steps.NodeName.field...
		// In a real execution, we would look up the "Execution State" passed in ctx.
		// For now, let's assume ctx.InputData contains a "steps" key which mimics the global state.
		// If not found, we fall back to looking directly in InputData for backward compatibility.
		if steps, ok := ctx.InputData["steps"].(map[string]interface{}); ok {
			current = steps
		} else {
			// Fallback: treat InputData as the root for "steps" (though typically InputData is just the previous node's output)
			// This part depends heavily on how the Workflow constructs NodeContext.
			// Let's assume for this MVP that the Workflow passes the ENTIRE execution state history in `InputData["steps"]`.
			return nil, fmt.Errorf("steps context not found in input")
		}
	case "input":
		// Direct input to this node
		current = ctx.InputData
	case "config":
		current = ctx.Config
	default:
		return nil, fmt.Errorf("unknown root object: %s (expected steps, input, or config)", root)
	}

	// 2. Traverse
	// We started at index 0 (root), so we loop from 1
	for i := 1; i < len(parts); i++ {
		key := parts[i]
		
		// Check for array indexing logic e.g. "users[0]"
		arrayMatch := regexp.MustCompile(`^(\w+)\[(\d+)\]$`).FindStringSubmatch(key)
		if len(arrayMatch) > 0 {
			key = arrayMatch[1]
			index := arrayMatch[2]
			
			// 1. Get Array
			m, ok := current.(map[string]interface{})
			if !ok {
				return nil, fmt.Errorf("cannot access property '%s' on non-map object at '%s'", key, strings.Join(parts[:i], "."))
			}
			
			arrVal, exists := m[key]
			if !exists {
				return nil, fmt.Errorf("property '%s' not found at '%s'", key, strings.Join(parts[:i], "."))
			}
			
			// 2. Access Index
			arr, ok := arrVal.([]interface{})
			if !ok {
				 return nil, fmt.Errorf("property '%s' is not an array", key)
			}
			
			// Convert index string to int
			idx := 0
			fmt.Sscanf(index, "%d", &idx)
			
			if idx < 0 || idx >= len(arr) {
				return nil, fmt.Errorf("array index %d out of bounds for '%s'", idx, key)
			}
			
			current = arr[idx]
		} else {
			// Normal Map Access
			m, ok := current.(map[string]interface{})
			if !ok {
				return nil, fmt.Errorf("cannot access property '%s' on non-map object at '%s'", key, strings.Join(parts[:i], "."))
			}
			
			val, exists := m[key]
			if !exists {
				return nil, fmt.Errorf("property '%s' not found at '%s'", key, strings.Join(parts[:i], "."))
			}
			current = val
		}
	}

	return current, nil
}

// Helper to evaluate a configuration map (recursively if needed, but simple for now)
func (e *ExpressionEngine) EvaluateMap(config map[string]interface{}, ctx NodeContext) (map[string]interface{}, error) {
	result := make(map[string]interface{})
	for k, v := range config {
		str, ok := v.(string)
		if ok {
			eval, err := e.Evaluate(str, ctx)
			if err != nil {
				return nil, err
			}
			result[k] = eval
		} else {
			result[k] = v
		}
	}
	return result, nil
}
