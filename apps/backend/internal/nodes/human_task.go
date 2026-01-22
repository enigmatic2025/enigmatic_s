package nodes

import (
	"context"
	"fmt"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type HumanTaskNode struct{}

func (n *HumanTaskNode) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Parse Configuration
	title, _ := input.Config["title"].(string)
	
	// 'description' in generic node data is for the designer (documentation).
	// 'instructions' is the specific prompt for the human task.
	// We prioritize instructions, but fallback to description for backward compat.
	description, _ := input.Config["instructions"].(string)
	if description == "" {
		description, _ = input.Config["description"].(string)
	}

	assignee, _ := input.Config["assignee"].(string)

	// Default values
	if title == "" {
		title = "Untitled Task"
	}
	if assignee == "" {
		// Fallback or error? For now, allow empty for "unassigned" queue
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

	taskRecord := struct {
		FlowID      string      `json:"flow_id"`
		RunID       string      `json:"run_id"` // Temporal RunID
		Title       string      `json:"title"`
		Description string      `json:"description"`
		Assignee    string      `json:"assignee"`
		Status      string      `json:"status"`
		Schema      interface{} `json:"schema"`
		CreatedAt   time.Time   `json:"created_at"`
		UpdatedAt   time.Time   `json:"updated_at"`
	}{
		FlowID: "", // We need flowID. It is usually in input.Config or Context?
		// checking NodeContext struct: WorkflowID, StepID, InputData, Config.
		// WorkflowID is Temporal WorkflowID. We don't strictly have FlowID in Context unless we passed it.
		// Wait, 'system.go' RecordActionFlowActivity used params.FlowID.
		// In 'workflow.go', we see:
		// recordParams := RecordActionFlowParams{ FlowID: flowDefinition.ID ... }
		// But in NodeContext, we don't explicitly pass FlowID.
		// We might need to fetch it or store it in variables?
		// For now, let's leave FlowID empty or try to extract from WorkflowID if formatted 'flow-UUID'.

		RunID: input.WorkflowID, // Using WorkflowID as RunID reference (Temporal RunID is better but ctx info is limited here without Temporal SDK imports in `nodes` package)
		// Wait, input.WorkflowID IS the RunID usually ? No, it's Execution.ID.
		// Let's use input.WorkflowID for now.

		Title:       title,
		Description: description,
		Assignee:    assignee,
		Status:      "PENDING",
		Schema:      schema,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Hotfix: Try to extract FlowID from WorkflowID if it follows "flow-UUID" pattern
	// Or just query the DB for the flow associated with this workflow_id? efficiently?
	// Actually, `human_tasks` has foreign key to `flows`. We NEED a valid Flow ID.
	// Users might get FK violation if empty.
	// Let's check if `flow_id` is passed in `input.InputData` or `variables`?
	// In workflow.go, we pass "steps" and "variables".
	// Maybe we should add FlowID to NodeContext in workflow.go?
	// Plan: update workflow.go to pass FlowID in NodeContext.

	var results []map[string]interface{}
	err := client.DB.From("human_tasks").Insert(taskRecord).Execute(&results)
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
