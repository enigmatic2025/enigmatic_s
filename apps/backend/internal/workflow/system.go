package workflow

import (
	"context"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type RecordActionFlowParams struct {
	FlowID     string                 `json:"flow_id"`
	WorkflowID string                 `json:"workflow_id"`
	RunID      string                 `json:"run_id"`
	InputData  map[string]interface{} `json:"input_data"`
}

// RecordActionFlowActivity Inserts a record into the 'action_flows' table
func RecordActionFlowActivity(ctx context.Context, params RecordActionFlowParams) error {
	client := database.GetClient()

	// Ensure the table exists or we have the struct definition.
	// For MVP, using a map or struct. Let's use a struct matching the Supabase table.
	record := struct {
		FlowID     string                 `json:"flow_id"`
		TemporalID string                 `json:"temporal_id"`
		RunID      string                 `json:"run_id"`
		Status     string                 `json:"status"`
		InputData  map[string]interface{} `json:"input_data"`
		StartedAt  time.Time              `json:"started_at"`
	}{
		FlowID:     params.FlowID,
		TemporalID: params.WorkflowID,
		RunID:      params.RunID,
		Status:     "RUNNING",
		InputData:  params.InputData,
		StartedAt:  time.Now(),
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
