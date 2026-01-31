package nodes

import (
	"context"
	"fmt"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type HumanTaskNode struct{}

func (n *HumanTaskNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Initialize Expression Engine
	expressionEngine := NewExpressionEngine()

	// 2. Parse Configuration
	// User clarified: Node Label is for Designer (Map).
	// Task Title is for End User (Inbox) and can be dynamic.
	rawTitle, _ := input.Config["title"].(string)

	// Default values
	if rawTitle == "" {
		rawTitle, _ = input.Config["label"].(string) // Fallback to label if title is missing
	}
	if rawTitle == "" {
		rawTitle = "Untitled Task"
	}

	// Evaluate Title
	titleVal, err := expressionEngine.Evaluate(rawTitle, input)
	if err == nil {
		rawTitle = fmt.Sprintf("%v", titleVal)
	}
	title := rawTitle // Final evaluated title

	// 'instructions' parsing (Rich Text)
	instructions, _ := input.Config["instructions"].(string)
	// Evaluate Instructions
	instrVal, err := expressionEngine.Evaluate(instructions, input)
	if err == nil {
		instructions = fmt.Sprintf("%v", instrVal)
	}

	// 'description' parsing (Designer Description)
	description, _ := input.Config["description"].(string)
	// Evaluate Description
	descVal, err := expressionEngine.Evaluate(description, input)
	if err == nil {
		description = fmt.Sprintf("%v", descVal)
	}

	// 'information' parsing...
	information, _ := input.Config["information"].(string)

	// Evaluate Information
	infoVal, err := expressionEngine.Evaluate(information, input)
	if err == nil {
		information = fmt.Sprintf("%v", infoVal)
	}

	assignee, _ := input.Config["assignee"].(string)
	// (Evaluate assignee if we want dynamic assignment - good to have)
	assigneeVal, err := expressionEngine.Evaluate(assignee, input)
	if err == nil {
		assignee = fmt.Sprintf("%v", assigneeVal)
	}

	if assignee == "" {
		assignee = "unassigned"
	}

	// Schema validation/extraction
	schema := input.Config["schema"]
	if schema == nil {
		schema = []interface{}{}
	}

	// 2. Resolve Variables in Title/Assignee (Simple Templating)
	// We can use the ExpressionEngine here if we want dynamic assignees like "{{ trigger.email }}"
	// For MVP, assuming the frontend might have already resolved it or we do simplistic text replacement.
	// Since ExpressionEngine is available, let's try to resolve 'assignee' if it contains {{}}
	// But 'ExpressionEngine' struct needs instantiation.
	// Let's assume input.Config values are raw strings.
	// For now, simple string check.

	// 3. Create Task Record in DB
	client := database.GetClient()

	// Extract Assignments
	var assignments []map[string]interface{}
	if val, ok := input.Config["assignments"]; ok {
		if list, ok := val.([]interface{}); ok {
			for _, item := range list {
				if m, ok := item.(map[string]interface{}); ok {
					assignments = append(assignments, map[string]interface{}{
						"id":     m["id"],
						"type":   m["type"],
						"name":   m["name"],
						"avatar": m["avatar"],
						"info":   m["info"],
					})
				}
			}
		}
	} else if assignee != "" && assignee != "unassigned" {
		// Backwards compatibility: Create a simple assignment from legacy assignee field
		// We might not have ID/Avatar, but we can store the name/info
		assignments = append(assignments, map[string]interface{}{
			"id":     assignee, // Use value as ID for now
			"type":   "user",   // Guessing user
			"name":   assignee,
			"avatar": "",
			"info":   assignee,
		})
	}

	taskRecord := struct {
		FlowID       string                   `json:"flow_id"`
		RunID        string                   `json:"run_id"` // Temporal RunID
		Title        string                   `json:"title"`
		Description  string                   `json:"description"`
		Instructions string                   `json:"instructions"`
		Information  string                   `json:"information"`
		Assignee     string                   `json:"assignee"`
		Assignments  []map[string]interface{} `json:"assignments"`
		Status       string                   `json:"status"`
		Schema       interface{}              `json:"schema"`
		CreatedAt    time.Time                `json:"created_at"`
		UpdatedAt    time.Time                `json:"updated_at"`
	}{
		FlowID: input.FlowID,
		RunID:  input.RunID,

		Title:        title,
		Description:  description,
		Instructions: instructions,
		Information:  information,
		Assignee:     assignee,
		Assignments:  assignments,
		Status:       "PENDING",
		Schema:       schema,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Ensure FlowID is present to avoid Foreign Key violations
	if taskRecord.FlowID == "" {
		return &NodeResult{
			Status: StatusFailed,
			Error:  "flow_id is missing",
		}, nil
	}

	var results []map[string]interface{}
	err = client.DB.From("human_tasks").Insert(taskRecord).Execute(&results)
	if err != nil {
		return &NodeResult{
			Status: StatusFailed,
			Error:  fmt.Sprintf("failed to create human task: %v", err),
		}, nil
	}

	// 4. Suspend Workflow
	return &NodeResult{
		Status: StatusPaused,
		Output: map[string]interface{}{
			"task_id": results[0]["id"], // Return the DB ID so we can correlate later
			"message": "Waiting for human action",
		},
	}, nil
}
