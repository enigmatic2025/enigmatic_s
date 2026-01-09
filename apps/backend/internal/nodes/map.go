package nodes

import (
	"context"
	"fmt"
)

// MapNode transforms input data into a new structure.
// Config expects a "mappings" definition and optional "fromArray" for iteration.
type MapNode struct{}

// Execute performs the data transformation.
func (n *MapNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	engine := NewExpressionEngine()
	mappings, _ := input.Config["mappings"].([]interface{})

	// Check for Array Mode
	fromArrayExp, _ := input.Config["fromArray"].(string)
	if fromArrayExp != "" {
		// Evaluate the array source
		arrayVal, err := engine.Evaluate(fromArrayExp, input)
		if err != nil {
			return nil, fmt.Errorf("failed to evaluate array source: %v", err)
		}

		items, ok := arrayVal.([]interface{})
		if !ok {
			// Fallback: If it's NOT an array (e.g. single object), wrap it as a single item
			items = []interface{}{arrayVal}
		}

		results := make([]map[string]interface{}, 0, len(items))

		for _, item := range items {
			// Create loop context
			loopInput := input
			// Shallow copy InputData to inject 'item' safely
			loopInput.InputData = make(map[string]interface{}, len(input.InputData)+1)
			for k, v := range input.InputData {
				loopInput.InputData[k] = v
			}
			loopInput.InputData["item"] = item

			results = append(results, n.mapObject(engine, mappings, loopInput))
		}

		return &NodeResult{
			Status: StatusSuccess,
			Output: map[string]interface{}{
				"data":  results,
				"count": len(results),
			},
		}, nil
	}

	// Single Object Mode
	return &NodeResult{
		Status: StatusSuccess,
		Output: n.mapObject(engine, mappings, input),
	}, nil
}

func (n *MapNode) mapObject(engine *ExpressionEngine, mappings []interface{}, ctx NodeContext) map[string]interface{} {
	result := make(map[string]interface{})
	for _, m := range mappings {
		mapping, ok := m.(map[string]interface{})
		if !ok {
			continue
		}
		target, _ := mapping["target"].(string)
		source, _ := mapping["source"].(string)
		if target == "" {
			continue
		}

		val, err := engine.Evaluate(source, ctx)
		if err != nil {
			// Fallback to literal
			result[target] = source
		} else {
			result[target] = val
		}
	}
	return result
}
