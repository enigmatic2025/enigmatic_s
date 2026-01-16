package workflow

import (
	"fmt"
)

// FlowDefinition maps the React Flow JSON structure
type FlowDefinition struct {
	ID    string `json:"id"`
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

type Node struct {
	ID   string                 `json:"id"`
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

type Edge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

// TopologicalSort sorts nodes by dependency order (Kahn's algorithm)
func TopologicalSort(flow FlowDefinition) ([]Node, error) {
	// 1. Build Adjacency List and In-Degree Map
	adj := make(map[string][]string)
	inDegree := make(map[string]int)
	nodeMap := make(map[string]Node)

	// Initialize in-degrees
	for _, node := range flow.Nodes {
		inDegree[node.ID] = 0
		nodeMap[node.ID] = node
	}

	for _, edge := range flow.Edges {
		// Validations: Ensure both Source and Target exist in the node list
		if _, ok := nodeMap[edge.Source]; !ok {
			fmt.Printf("Warning: Ignoring edge %s with unknown source %s\n", edge.ID, edge.Source)
			continue
		}
		if _, ok := nodeMap[edge.Target]; !ok {
			fmt.Printf("Warning: Ignoring edge %s with unknown target %s\n", edge.ID, edge.Target)
			continue
		}

		adj[edge.Source] = append(adj[edge.Source], edge.Target)
		inDegree[edge.Target]++
	}

	// 2. Queue for nodes with 0 in-degree
	queue := []string{}
	for id, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, id)
		}
	}

	// 3. Process
	var sorted []Node
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]

		sorted = append(sorted, nodeMap[u])

		for _, v := range adj[u] {
			inDegree[v]--
			if inDegree[v] == 0 {
				queue = append(queue, v)
			}
		}
	}

	// 4. Cycle Detection
	// 4. Cycle Detection
	if len(sorted) != len(flow.Nodes) {
		return nil, fmt.Errorf("cycle detected or disjoint graph: sorted %d vs total %d nodes", len(sorted), len(flow.Nodes))
	}

	return sorted, nil
}
