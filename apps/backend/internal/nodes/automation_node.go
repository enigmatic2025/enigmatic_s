package nodes

import (
	"context"
	"fmt"
	"log"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type AutomationNodeExecutor struct{}

type Subscription struct {
	OrgID            string                 `json:"org_id"`
	FlowID           string                 `json:"flow_id"`
	WorkflowID       string                 `json:"workflow_id"`
	RunID            string                 `json:"run_id"`
	StepID           string                 `json:"step_id"`
	EventName        string                 `json:"event_name"`
	CorrelationKey   string                 `json:"correlation_key"`   // Legacy/Partial (first key)
	CorrelationValue string                 `json:"correlation_value"` // Legacy/Partial (first value)
	Criteria         map[string]interface{} `json:"criteria"`
	Status           string                 `json:"status"`
}

func (e *AutomationNodeExecutor) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 1. Generate Correlation ID (Legacy)
	actionID := fmt.Sprintf("%s:%s", input.RunID, input.StepID)

	// 2. Check for Correlation Configuration
	description := "Waiting for external event..."

	// 3. Register Subscription (Single Row for AND logic)
	var criteria = make(map[string]interface{})
	eventName := "default"

	// Check for list format
	if list, ok := input.Config["correlations"].([]interface{}); ok {
		for i, item := range list {
			if m, ok := item.(map[string]interface{}); ok {
				// Use the event name from the first rule as the primary event
				if i == 0 {
					if v, ok := m["eventName"].(string); ok && v != "" {
						eventName = v
					}
				}

				key, _ := m["key"].(string)
				val, _ := m["value"].(string)

				if key != "" && val != "" {
					criteria[key] = val
				}
			}
		}
	} else {
		// Fallback
		if v, ok := input.Config["eventName"].(string); ok && v != "" {
			eventName = v
		}
		k, _ := input.Config["correlationKey"].(string)
		v, _ := input.Config["correlationValue"].(string)
		if k != "" && v != "" {
			criteria[k] = v
		}
	}

	registered := false
	if len(criteria) > 0 {
		client := database.GetClient()
		sub := Subscription{
			OrgID:      input.OrgID,
			FlowID:     input.FlowID,
			WorkflowID: input.WorkflowID,
			RunID:      input.RunID,
			StepID:     input.StepID,
			EventName:  eventName,
			Criteria:   criteria,
			Status:     "active",
		}

		var results []Subscription
		err := client.DB.From("automation_subscriptions").Insert(sub).Execute(&results)
		if err != nil {
			log.Printf("Failed to create automation subscription: %v", err)
			return nil, fmt.Errorf("failed to register subscription: %w", err)
		}
		registered = true
		description = fmt.Sprintf("Waiting for event '%s' with %d criteria...", eventName, len(criteria))
	}

	// 4. Prepare Metadata for UI
	output := map[string]interface{}{
		"action_id":   actionID,
		"status":      "waiting",
		"message":     description,
		"correlation": registered,
	}

	return &NodeResult{
		Status: StatusPaused,
		Output: output,
	}, nil
}
