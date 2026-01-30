package workflow

import (
	"context"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type RecordActionFlowParams struct {
	FlowID      string                   `json:"flow_id"`
	WorkflowID  string                   `json:"workflow_id"`
	RunID       string                   `json:"run_id"`
	InputData   map[string]interface{}   `json:"input_data"`
	Title       string                   `json:"title"`
	Description string                   `json:"description"`
	Priority    string                   `json:"priority"`    // Added Priority
	Assignments []map[string]interface{} `json:"assignments"` // Changed to interface{}
	InfoFields  []map[string]string      `json:"info_fields"`
}

// RecordActionFlowActivity Inserts a record into the 'action_flows' table
func RecordActionFlowActivity(ctx context.Context, params RecordActionFlowParams) error {
	client := database.GetClient()

	// Ensure the table exists or we have the struct definition.
	// For MVP, using a map or struct. Let's use a struct matching the Supabase table.
	// Handle nullable FlowID (e.g. for Test Runs of unsaved flows)
	var flowIDPtr *string
	if params.FlowID != "" {
		flowIDPtr = &params.FlowID
	}

	// Merge InfoFields into InputData as metadata
	finalInputData := params.InputData
	if finalInputData == nil {
		finalInputData = make(map[string]interface{})
	}
	// Merge InfoFields into a clean Map for KeyData
	keyData := make(map[string]interface{})
	if len(params.InfoFields) > 0 {
		for _, field := range params.InfoFields {
			if label, ok := field["label"]; ok {
				// Use label as key, but might want to slugify it?
				// For now, keying by label is what the UI likely expects or simple mapping
				// Actually, `InfoFields` is a list of {label, value}.
				// Let's store it as the backend received it, or simplify?
				// To allow "Driver Name": "Phi Tran" in JSONB:
				keyData[label] = field["value"]
			}
		}
	}

	// Persist Description in InputData since we might lack a dedicated column
	if params.Description != "" {
		finalInputData["description"] = params.Description
	}
	// Persist Title in InputData as well for robustness
	if params.Title != "" {
		finalInputData["title"] = params.Title
	}

	record := struct {
		FlowID      *string                  `json:"flow_id"`
		TemporalID  string                   `json:"temporal_id"`
		RunID       string                   `json:"run_id"`
		Status      string                   `json:"status"`
		InputData   map[string]interface{}   `json:"input_data"`
		KeyData     map[string]interface{}   `json:"key_data"`
		Priority    string                   `json:"priority"`
		Assignments []map[string]interface{} `json:"assignments"` // Changed to interface{}
		StartedAt   time.Time                `json:"started_at"`
	}{
		FlowID:      flowIDPtr,
		TemporalID:  params.WorkflowID,
		RunID:       params.RunID,
		Status:      "RUNNING",
		InputData:   finalInputData,
		KeyData:     keyData,
		Priority:    params.Priority,
		Assignments: params.Assignments, // Initialize Assignments
		StartedAt:   time.Now(),
	}

	// Insert into 'action_flows'
	// Note: You must ensure this table exists in your Supabase migrations!
	var results []map[string]interface{}
	err := client.DB.From("action_flows").Insert(record).Execute(&results)
	if err != nil {
		return err
	}

	return nil
}
