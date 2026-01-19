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

	// Check if the ENTIRE string is just one expression (e.g. "{{ steps.foo }}")
	// If so, we return the raw interface{} value to preserve types (maps, slices)
	trimmed := strings.TrimSpace(expression)
	loc := re.FindStringIndex(trimmed)
	if loc != nil && loc[0] == 0 && loc[1] == len(trimmed) {
		match := re.FindStringSubmatch(trimmed)
		content := match[1]
		return e.resolvePath(content, ctx)
	}

	// Otherwise, it's string interpolation (e.g. "Hello {{ steps.name }}")
	// ReplaceAllStringFunc lets us handle each match
	var err error
	result := re.ReplaceAllStringFunc(expression, func(match string) string {
		// match is like "{{ steps.foo.data }}"
		// content is like "steps.foo.data"
		content := re.FindStringSubmatch(match)[1]
		val, evalErr := e.resolvePath(content, ctx)
		if evalErr != nil {
			err = evalErr // Capture error
			return match  // Return original on error
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
		// Step Data Access: Access data from previous steps via 'steps.StepID'.
		// If 'steps' is not explicitly in InputData, we fallback to treating InputData as the step container.
		if steps, ok := ctx.InputData["steps"].(map[string]interface{}); ok {
			current = steps
		} else {
			return nil, fmt.Errorf("steps context not found in input")
		}
	case "variables":
		// variables.varName
		if vars, ok := ctx.InputData["variables"].(map[string]interface{}); ok {
			current = vars
		} else {
			return nil, fmt.Errorf("variables context not found in input")
		}
	case "input":
		// Direct input to this node
		current = ctx.InputData
	case "config":
		current = ctx.Config
	case "item":
		// Loop item context
		if val, ok := ctx.InputData["item"]; ok {
			current = val
		} else {
			return nil, fmt.Errorf("item context not found (are you inside a loop?)")
		}
	default:
		return nil, fmt.Errorf("unknown root object: %s (expected steps, input, config, or item)", root)
	}

	// 2. Traverse
	return e.Traverse(current, parts[1:])
}

// Traverse navigates an object using a list of path parts (keys or array indices)
func (e *ExpressionEngine) Traverse(current interface{}, parts []string) (interface{}, error) {
	for i := 0; i < len(parts); i++ {
		key := parts[i]

		// Check for array indexing logic e.g. "users[0]"
		arrayMatch := regexp.MustCompile(`^(\w+)\[(\d+)\]$`).FindStringSubmatch(key)
		if len(arrayMatch) > 0 {
			key = arrayMatch[1]
			index := arrayMatch[2]

			// 1. Get Array
			m, ok := current.(map[string]interface{})
			if !ok {
				// Handle case where we try to access property on nil or non-map
				if current == nil {
					return nil, fmt.Errorf("cannot access property '%s' on nil", key)
				}
				return nil, fmt.Errorf("cannot access property '%s' on non-map object (type %T)", key, current)
			}

			arrVal, exists := m[key]
			if !exists {
				return nil, fmt.Errorf("property '%s' not found", key)
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
				if current == nil {
					return nil, fmt.Errorf("cannot access property '%s' on nil", key)
				}
				return nil, fmt.Errorf("cannot access property '%s' on non-map object (type %T)", key, current)
			}

			val, exists := m[key]
			if !exists {
				return nil, fmt.Errorf("property '%s' not found", key)
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
