package nodes

import (
	"context"
	"fmt"
	"log"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type AutomationNodeExecutor struct{}

type Subscription struct {
	OrgID            string `json:"org_id"`
	FlowID           string `json:"flow_id"`
	WorkflowID       string `json:"workflow_id"`
	RunID            string `json:"run_id"`
	StepID           string `json:"step_id"`
	EventName        string `json:"event_name"`
	CorrelationKey   string `json:"correlation_key"`
	CorrelationValue string `json:"correlation_value"`
	Status           string `json:"status"`
}

func (e *AutomationNodeExecutor) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Generate Correlation ID (Legacy)
	actionID := fmt.Sprintf("%s:%s", input.RunID, input.StepID)

	// 2. Check for Correlation Configuration
	eventName, _ := input.Config["eventName"].(string)
	correlationKey, _ := input.Config["correlationKey"].(string)
	correlationValue, _ := input.Config["correlationValue"].(string)

	description := "Waiting for external event..."

	// 3. Register Subscription if configured
	if correlationKey != "" && correlationValue != "" {
		if eventName == "" {
			eventName = "default"
		}

		client := database.GetClient()
		sub := Subscription{
			OrgID:            input.OrgID,
			FlowID:           input.FlowID,
			WorkflowID:       input.WorkflowID,
			RunID:            input.RunID,
			StepID:           input.StepID,
			EventName:        eventName,
			CorrelationKey:   correlationKey,
			CorrelationValue: correlationValue,
			Status:           "active",
		}

		var results []Subscription
		err := client.DB.From("automation_subscriptions").Insert(sub).Execute(&results)
		if err != nil {
			log.Printf("Failed to create automation subscription: %v", err)
			// Non-fatal? Or should we fail the step? failing is safer.
			return nil, fmt.Errorf("failed to register subscription: %w", err)
		}

		description = fmt.Sprintf("Waiting for event '%s' where %s = %s", eventName, correlationKey, correlationValue)
	}

	// 4. Prepare Metadata for UI
	output := map[string]interface{}{
		"action_id":   actionID,
		"status":      "waiting",
		"message":     description,
		"correlation": correlationKey != "",
	}

	return &NodeResult{
		Status: StatusPaused,
		Output: output,
	}, nil
}
