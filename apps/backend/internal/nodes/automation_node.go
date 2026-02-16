package nodes

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/uuid"
	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type AutomationNodeExecutor struct{}

type Subscription struct {
	OrgID        string                 `json:"org_id"`
	FlowID       string                 `json:"flow_id"`
	WorkflowID   string                 `json:"workflow_id"`
	RunID        string                 `json:"run_id"`
	StepID       string                 `json:"step_id"`
	EventName    string                 `json:"event_name"`
	Criteria     map[string]interface{} `json:"criteria"`
	WebhookToken string                 `json:"webhook_token"`
	Status       string                 `json:"status"`
}

func (e *AutomationNodeExecutor) Execute(ctx context.Context, input NodeContext) (*NodeResult, error) {
	// 0. Check for mock data (test mode) — skip real webhook creation
	if mockDataMap, ok := input.InputData["__mock_data"].(map[string]interface{}); ok {
		if nodeMock, ok := mockDataMap[input.StepID].(map[string]interface{}); ok {
			if payload, ok := nodeMock["payload"].(map[string]interface{}); ok {
				fmt.Printf("[TEST MODE] Automation node '%s' auto-resumed with mock payload\n", input.StepID)
				output := map[string]interface{}{
					"webhook_url": "mock://test-mode",
					"status":      "completed",
					"message":     "Auto-resumed with mock data (test mode)",
				}
				for k, v := range payload {
					output[k] = v
				}
				return &NodeResult{
					Status: StatusSuccess,
					Output: output,
				}, nil
			}
		}
	}

	actionID := fmt.Sprintf("%s:%s", input.RunID, input.StepID)

	// Generate unique webhook token
	webhookToken := uuid.New().String()

	// Build webhook URL from PUBLIC_URL env
	publicURL := strings.TrimRight(os.Getenv("PUBLIC_URL"), "/")
	webhookURL := fmt.Sprintf("%s/api/webhooks/%s", publicURL, webhookToken)

	// Parse correlation config (advanced feature)
	var criteria = make(map[string]interface{})
	eventName := "default"

	if list, ok := input.Config["correlations"].([]interface{}); ok {
		// Use event name from node-level config (not per-rule)
		if v, ok := input.Config["eventName"].(string); ok && v != "" {
			eventName = v
		}
		for _, item := range list {
			if m, ok := item.(map[string]interface{}); ok {
				// First rule's eventName as fallback if no node-level eventName
				if eventName == "default" {
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
		// Legacy fallback
		if v, ok := input.Config["eventName"].(string); ok && v != "" {
			eventName = v
		}
		k, _ := input.Config["correlationKey"].(string)
		v, _ := input.Config["correlationValue"].(string)
		if k != "" && v != "" {
			criteria[k] = v
		}
	}

	// Register subscription with webhook token
	client := database.GetClient()
	sub := Subscription{
		OrgID:        input.OrgID,
		FlowID:       input.FlowID,
		WorkflowID:   input.WorkflowID,
		RunID:        input.RunID,
		StepID:       input.StepID,
		EventName:    eventName,
		Criteria:     criteria,
		WebhookToken: webhookToken,
		Status:       "active",
	}

	var results []Subscription
	err := client.DB.From("automation_subscriptions").Insert(sub).Execute(&results)
	if err != nil {
		log.Printf("Failed to create automation subscription: %v", err)
		return nil, fmt.Errorf("failed to register subscription: %w", err)
	}

	description := fmt.Sprintf("Waiting for webhook or event '%s'", eventName)
	if len(criteria) > 0 {
		description += fmt.Sprintf(" with %d correlation criteria", len(criteria))
	}

	// Output — webhook_url is available to downstream steps via {{ steps.NodeId.output.webhook_url }}
	output := map[string]interface{}{
		"action_id":     actionID,
		"webhook_token": webhookToken,
		"webhook_url":   webhookURL,
		"status":        "waiting",
		"message":       description,
		"correlation":   len(criteria) > 0,
	}

	return &NodeResult{
		Status: StatusPaused,
		Output: output,
	}, nil
}
