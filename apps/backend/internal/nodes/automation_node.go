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
	description := "Waiting for external event..."

	// 3. Register Subscriptions
	var correlations []map[string]string

	// Check for new list format
	if list, ok := input.Config["correlations"].([]interface{}); ok {
		for _, item := range list {
			if m, ok := item.(map[string]interface{}); ok {
				c := map[string]string{}
				if v, ok := m["eventName"].(string); ok {
					c["eventName"] = v
				}
				if v, ok := m["key"].(string); ok {
					c["key"] = v
				}
				if v, ok := m["value"].(string); ok {
					c["value"] = v
				}
				correlations = append(correlations, c)
			}
		}
	} else {
		// Fallback to legacy single fields
		eventName, _ := input.Config["eventName"].(string)
		correlationKey, _ := input.Config["correlationKey"].(string)
		correlationValue, _ := input.Config["correlationValue"].(string)

		if correlationKey != "" && correlationValue != "" {
			correlations = append(correlations, map[string]string{
				"eventName": eventName,
				"key":       correlationKey,
				"value":     correlationValue,
			})
		}
	}

	client := database.GetClient()
	registered := 0

	for _, c := range correlations {
		eventName := c["eventName"]
		key := c["key"]
		value := c["value"]

		if key == "" || value == "" {
			continue
		}
		if eventName == "" {
			eventName = "default"
		}

		sub := Subscription{
			OrgID:            input.OrgID,
			FlowID:           input.FlowID,
			WorkflowID:       input.WorkflowID,
			RunID:            input.RunID,
			StepID:           input.StepID,
			EventName:        eventName,
			CorrelationKey:   key,
			CorrelationValue: value,
			Status:           "active",
		}

		var results []Subscription
		err := client.DB.From("automation_subscriptions").Insert(sub).Execute(&results)
		if err != nil {
			log.Printf("Failed to create automation subscription: %v", err)
			continue
		}
		registered++
	}

	// 4. Prepare Metadata for UI
	output := map[string]interface{}{
		"action_id":   actionID,
		"status":      "waiting",
		"message":     description,
		"correlation": registered > 0,
	}

	return &NodeResult{
		Status: StatusPaused,
		Output: output,
	}, nil
}
