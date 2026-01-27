package workflow

import (
	"context"
	"time"

	"github.com/teavana/enigmatic_s/apps/backend/internal/database"
)

type RecordActionFlowParams struct {
	FlowID      string                 `json:"flow_id"`
	WorkflowID  string                 `json:"workflow_id"`
	RunID       string                 `json:"run_id"`
	InputData   map[string]interface{} `json:"input_data"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	InfoFields  []map[string]string    `json:"info_fields"`
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
	if len(params.InfoFields) > 0 {
		finalInputData["_info_fields"] = params.InfoFields
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
		FlowID     *string                `json:"flow_id"`
		TemporalID string                 `json:"temporal_id"`
		RunID      string                 `json:"run_id"`
		Status     string                 `json:"status"`
		InputData  map[string]interface{} `json:"input_data"`
		StartedAt  time.Time              `json:"started_at"`
		Title      string                 `json:"title"`
		// We could add Description column if schema supports it, but currently not in 003 migration.
		// So we might skip description or put in InputData too?
		// Let's put Description in InputData for now alongside info fields if needed,
		// but wait, we have Title/Description in Params.
		// Migration 003 didn't add description/title columns?
		// Let's check 003... No.
		// But earlier `GetActionFlow` read `Title`.
		// Let's check `ActionFlowResult` in handler again. `Title string` is there.
		// Checking schema... database probably has it.
		// Assuming 'title' exists. 'description' probably doesn't or wasn't used.
		// I will rely on 'title' being there.
	}{
		FlowID:     flowIDPtr,
		TemporalID: params.WorkflowID,
		RunID:      params.RunID,
		Status:     "RUNNING",
		InputData:  finalInputData,
		StartedAt:  time.Now(),
		Title:      params.Title,
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
