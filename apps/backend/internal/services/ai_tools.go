package services

import (
	"encoding/json"
	"fmt"
	"regexp"

	"github.com/nedpals/supabase-go"
	"github.com/sirupsen/logrus"
)

// ToolContext carries org-scoping information through tool execution
type ToolContext struct {
	OrgID        string
	OrgSlug      string
	IsSuperAdmin bool // true if orgSlug == "enigmatic-i2v2i"
	Client       *supabase.Client
	Logger       *logrus.Logger
}

var uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

// GetToolDefinitions returns all tool definitions for Natalie's database access
func GetToolDefinitions() []Tool {
	return []Tool{
		{
			Type: "function",
			Function: Function{
				Name:        "list_flows",
				Description: "List workflow definitions (flows) for the organization. Returns flow id, name, description, version, active status, and timestamps. Use this to answer questions about available workflows, how many flows exist, which are active/inactive.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"is_active": map[string]interface{}{
							"type":        "boolean",
							"description": "Filter by active status. Omit to get all flows.",
						},
						"name_contains": map[string]interface{}{
							"type":        "string",
							"description": "Filter flows whose name contains this substring (case-insensitive).",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max number of results to return. Default 50, max 100.",
						},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "get_flow_details",
				Description: "Get detailed information about a specific flow by its ID. Returns the full flow record including version, publish status, and a summary of its node structure. Use this when the user asks about a specific flow's configuration.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"flow_id": map[string]interface{}{
							"type":        "string",
							"description": "The UUID of the flow to retrieve.",
						},
					},
					"required": []string{"flow_id"},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "list_action_flows",
				Description: "List action flow executions (running instances of workflows). Returns id, flow_id, status, started_at, completed_at, priority, and key_data. Use this to answer questions about workflow runs, their statuses, recent executions, or failures.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"status": map[string]interface{}{
							"type":        "string",
							"description": "Filter by execution status (e.g. RUNNING, COMPLETED, FAILED, TERMINATED, PAUSED).",
						},
						"flow_id": map[string]interface{}{
							"type":        "string",
							"description": "Filter by the parent flow UUID.",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max number of results. Default 25, max 100.",
						},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "get_action_flow_details",
				Description: "Get detailed information about a specific action flow execution, including its individual step actions and any error messages. Use this when the user asks about a specific run's progress, errors, or step details.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"action_flow_id": map[string]interface{}{
							"type":        "string",
							"description": "The UUID of the action flow execution.",
						},
					},
					"required": []string{"action_flow_id"},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "list_human_tasks",
				Description: "List human tasks (manual steps requiring user action). Returns id, title, status, assignee, due dates, and instructions. Use this when the user asks about pending tasks, assigned work, or task completion status.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"status": map[string]interface{}{
							"type":        "string",
							"description": "Filter by task status (PENDING, COMPLETED, EXPIRED).",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max number of results. Default 25, max 100.",
						},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "query_audit_logs",
				Description: "Query the activity/audit log for the organization. Returns event_type, user_id, resource_id, details, and timestamps. Use this to answer questions about recent activity, who did what, and system events.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"event_type": map[string]interface{}{
							"type":        "string",
							"description": "Filter by event type (e.g. flow.started, flow.completed, task.completed).",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max number of results. Default 25, max 100.",
						},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "list_teams_and_members",
				Description: "List teams in the organization. Returns team id, name, description, and creation date. Use when the user asks about team structure or available teams.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max number of results. Default 50, max 100.",
						},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: Function{
				Name:        "list_comments",
				Description: "List comments/discussion on a specific action flow execution. Returns comment id, content, user_name, created_at, and like_count. Use when the user asks about discussion, notes, or comments on a workflow run.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"action_flow_id": map[string]interface{}{
							"type":        "string",
							"description": "The UUID of the action flow to get comments for.",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max number of results. Default 25, max 100.",
						},
					},
					"required": []string{"action_flow_id"},
				},
			},
		},
	}
}

// ExecuteTool dispatches a tool call to the appropriate executor function
func ExecuteTool(ctx ToolContext, toolCall ToolCall) (string, error) {
	var args map[string]interface{}
	if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &args); err != nil {
		args = map[string]interface{}{}
	}

	ctx.Logger.WithFields(logrus.Fields{
		"tool":    toolCall.Function.Name,
		"args":    toolCall.Function.Arguments,
		"org_id":  ctx.OrgID,
		"is_super": ctx.IsSuperAdmin,
	}).Info("Executing tool call")

	switch toolCall.Function.Name {
	case "list_flows":
		return executeListFlows(ctx, args)
	case "get_flow_details":
		return executeGetFlowDetails(ctx, args)
	case "list_action_flows":
		return executeListActionFlows(ctx, args)
	case "get_action_flow_details":
		return executeGetActionFlowDetails(ctx, args)
	case "list_human_tasks":
		return executeListHumanTasks(ctx, args)
	case "query_audit_logs":
		return executeQueryAuditLogs(ctx, args)
	case "list_teams_and_members":
		return executeListTeams(ctx, args)
	case "list_comments":
		return executeListComments(ctx, args)
	default:
		return fmt.Sprintf(`{"error": "unknown tool: %s"}`, toolCall.Function.Name), nil
	}
}

// ---- Tool Executors ----
//
// Note on postgrest-go query chaining:
// Select().Limit() returns *SelectRequestBuilder
// Eq()/Ilike()/In() return *FilterRequestBuilder
// Both have Execute(), but they're different types.
// So Limit() must come before any filter methods,
// and we use FilterRequestBuilder for the final query variable.

func executeListFlows(ctx ToolContext, args map[string]interface{}) (string, error) {
	limit := getIntArg(args, "limit", 50, 100)

	selectQuery := ctx.Client.DB.From("flows").
		Select("id, name, description, version, is_active, published_at, created_at, updated_at").
		Limit(limit)

	// Start filter chain — always apply at least org scoping for non-superadmin
	filterQuery := selectQuery.Filter("id", "neq", "00000000-0000-0000-0000-000000000000") // no-op filter to get FilterRequestBuilder

	if !ctx.IsSuperAdmin {
		filterQuery = filterQuery.Eq("org_id", ctx.OrgID)
	}

	if isActive, ok := getBoolArg(args, "is_active"); ok {
		filterQuery = filterQuery.Eq("is_active", fmt.Sprintf("%v", isActive))
	}

	if nameContains := getStringArg(args, "name_contains"); nameContains != "" {
		filterQuery = filterQuery.Ilike("name", "*"+nameContains+"*")
	}

	var results []map[string]interface{}
	if err := filterQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}

	return marshalResult(results)
}

func executeGetFlowDetails(ctx ToolContext, args map[string]interface{}) (string, error) {
	flowID := getStringArg(args, "flow_id")
	if flowID == "" || !uuidRegex.MatchString(flowID) {
		return `{"error": "valid flow_id (UUID) is required"}`, nil
	}

	filterQuery := ctx.Client.DB.From("flows").
		Select("id, name, description, version, is_active, variables_schema, published_at, created_at, updated_at, definition").
		Limit(1).
		Eq("id", flowID)

	if !ctx.IsSuperAdmin {
		filterQuery = filterQuery.Eq("org_id", ctx.OrgID)
	}

	var results []map[string]interface{}
	if err := filterQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}

	if len(results) == 0 {
		return `{"error": "flow not found"}`, nil
	}

	flow := results[0]
	// Summarize the definition to avoid token explosion
	if def, ok := flow["definition"]; ok {
		flow["definition_summary"] = summarizeDefinition(def)
		delete(flow, "definition")
	}

	return marshalResult(flow)
}

func executeListActionFlows(ctx ToolContext, args map[string]interface{}) (string, error) {
	limit := getIntArg(args, "limit", 25, 100)

	selectQuery := ctx.Client.DB.From("action_flows").
		Select("id, flow_id, status, started_at, completed_at, priority, key_data, input_data").
		Limit(limit)

	filterQuery := selectQuery.Filter("id", "neq", "00000000-0000-0000-0000-000000000000")

	if !ctx.IsSuperAdmin {
		filterQuery = filterQuery.Eq("org_id", ctx.OrgID)
	}

	if status := getStringArg(args, "status"); status != "" {
		filterQuery = filterQuery.Eq("status", status)
	}

	if flowID := getStringArg(args, "flow_id"); flowID != "" && uuidRegex.MatchString(flowID) {
		filterQuery = filterQuery.Eq("flow_id", flowID)
	}

	var results []map[string]interface{}
	if err := filterQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}

	return marshalResult(results)
}

func executeGetActionFlowDetails(ctx ToolContext, args map[string]interface{}) (string, error) {
	actionFlowID := getStringArg(args, "action_flow_id")
	if actionFlowID == "" || !uuidRegex.MatchString(actionFlowID) {
		return `{"error": "valid action_flow_id (UUID) is required"}`, nil
	}

	// Fetch the action flow
	afQuery := ctx.Client.DB.From("action_flows").
		Select("id, flow_id, status, started_at, completed_at, priority, key_data, input_data, final_state").
		Limit(1).
		Eq("id", actionFlowID)

	if !ctx.IsSuperAdmin {
		afQuery = afQuery.Eq("org_id", ctx.OrgID)
	}

	var actionFlows []map[string]interface{}
	if err := afQuery.Execute(&actionFlows); err != nil {
		return jsonError(err), nil
	}

	if len(actionFlows) == 0 {
		return `{"error": "action flow not found"}`, nil
	}

	result := actionFlows[0]

	// Fetch associated actions (steps)
	var actions []map[string]interface{}
	err := ctx.Client.DB.From("actions").
		Select("id, node_id, type, status, started_at, completed_at, error_message, priority").
		Limit(50).
		Eq("action_flow_id", actionFlowID).
		Execute(&actions)

	if err == nil {
		result["actions"] = actions
	}

	return marshalResult(result)
}

func executeListHumanTasks(ctx ToolContext, args map[string]interface{}) (string, error) {
	limit := getIntArg(args, "limit", 25, 100)
	status := getStringArg(args, "status")

	if !ctx.IsSuperAdmin {
		// Scope via flow_id: get flow IDs belonging to this org
		var flows []struct {
			ID string `json:"id"`
		}
		if err := ctx.Client.DB.From("flows").Select("id").Eq("org_id", ctx.OrgID).Execute(&flows); err != nil {
			return jsonError(err), nil
		}

		if len(flows) == 0 {
			return `[]`, nil
		}

		flowIDs := make([]string, len(flows))
		for i, f := range flows {
			flowIDs[i] = f.ID
		}

		filterQuery := ctx.Client.DB.From("human_tasks").
			Select("id, flow_id, run_id, title, status, assignee, description, created_at, updated_at").
			Limit(limit).
			In("flow_id", flowIDs)

		if status != "" {
			filterQuery = filterQuery.Eq("status", status)
		}

		var results []map[string]interface{}
		if err := filterQuery.Execute(&results); err != nil {
			return jsonError(err), nil
		}
		return marshalResult(results)
	}

	// Superadmin: no org filter
	selectQuery := ctx.Client.DB.From("human_tasks").
		Select("id, flow_id, run_id, title, status, assignee, description, created_at, updated_at").
		Limit(limit)

	if status != "" {
		filterQuery := selectQuery.Eq("status", status)
		var results []map[string]interface{}
		if err := filterQuery.Execute(&results); err != nil {
			return jsonError(err), nil
		}
		return marshalResult(results)
	}

	var results []map[string]interface{}
	if err := selectQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}
	return marshalResult(results)
}

func executeQueryAuditLogs(ctx ToolContext, args map[string]interface{}) (string, error) {
	limit := getIntArg(args, "limit", 25, 100)
	eventType := getStringArg(args, "event_type")

	selectQuery := ctx.Client.DB.From("audit_logs").
		Select("id, event_type, user_id, resource_id, details, created_at").
		Limit(limit)

	if !ctx.IsSuperAdmin {
		filterQuery := selectQuery.Eq("org_id", ctx.OrgID)
		if eventType != "" {
			filterQuery = filterQuery.Eq("event_type", eventType)
		}
		var results []map[string]interface{}
		if err := filterQuery.Execute(&results); err != nil {
			return jsonError(err), nil
		}
		return marshalResult(results)
	}

	// Superadmin
	if eventType != "" {
		filterQuery := selectQuery.Eq("event_type", eventType)
		var results []map[string]interface{}
		if err := filterQuery.Execute(&results); err != nil {
			return jsonError(err), nil
		}
		return marshalResult(results)
	}

	var results []map[string]interface{}
	if err := selectQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}
	return marshalResult(results)
}

func executeListTeams(ctx ToolContext, args map[string]interface{}) (string, error) {
	limit := getIntArg(args, "limit", 50, 100)

	selectQuery := ctx.Client.DB.From("teams").
		Select("id, name, description, created_at").
		Limit(limit)

	if !ctx.IsSuperAdmin {
		filterQuery := selectQuery.Eq("org_id", ctx.OrgID)
		var results []map[string]interface{}
		if err := filterQuery.Execute(&results); err != nil {
			return jsonError(err), nil
		}
		return marshalResult(results)
	}

	var results []map[string]interface{}
	if err := selectQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}

	return marshalResult(results)
}

func executeListComments(ctx ToolContext, args map[string]interface{}) (string, error) {
	actionFlowID := getStringArg(args, "action_flow_id")
	if actionFlowID == "" || !uuidRegex.MatchString(actionFlowID) {
		return `{"error": "valid action_flow_id (UUID) is required"}`, nil
	}
	limit := getIntArg(args, "limit", 25, 100)

	// Verify the action flow belongs to this org (unless superadmin)
	if !ctx.IsSuperAdmin {
		afQuery := ctx.Client.DB.From("action_flows").
			Select("id").
			Limit(1).
			Eq("id", actionFlowID).
			Eq("org_id", ctx.OrgID)

		var af []map[string]interface{}
		if err := afQuery.Execute(&af); err != nil || len(af) == 0 {
			return `{"error": "action flow not found or access denied"}`, nil
		}
	}

	filterQuery := ctx.Client.DB.From("comments").
		Select("id, content, user_name, created_at, like_count, parent_id").
		Limit(limit).
		Eq("action_flow_id", actionFlowID)

	var results []map[string]interface{}
	if err := filterQuery.Execute(&results); err != nil {
		return jsonError(err), nil
	}

	return marshalResult(results)
}

// ---- Helpers ----

func getStringArg(args map[string]interface{}, key string) string {
	if v, ok := args[key].(string); ok {
		if len(v) > 200 {
			return v[:200]
		}
		return v
	}
	return ""
}

func getIntArg(args map[string]interface{}, key string, defaultVal, maxVal int) int {
	if v, ok := args[key].(float64); ok {
		n := int(v)
		if n < 1 {
			return defaultVal
		}
		if n > maxVal {
			return maxVal
		}
		return n
	}
	return defaultVal
}

func getBoolArg(args map[string]interface{}, key string) (bool, bool) {
	if v, ok := args[key].(bool); ok {
		return v, true
	}
	return false, false
}

func jsonError(err error) string {
	return fmt.Sprintf(`{"error": "%s"}`, err.Error())
}

func marshalResult(data interface{}) (string, error) {
	b, err := json.Marshal(data)
	if err != nil {
		return jsonError(err), nil
	}
	return truncateResult(string(b)), nil
}

func truncateResult(s string) string {
	const maxLen = 15000
	if len(s) > maxLen {
		return s[:maxLen] + `... [truncated — ask the user to narrow their query]`
	}
	return s
}

// summarizeDefinition extracts node names and types from a flow definition
// to avoid sending massive JSON to the LLM
func summarizeDefinition(def interface{}) interface{} {
	defMap, ok := def.(map[string]interface{})
	if !ok {
		return "unable to parse definition"
	}

	summary := map[string]interface{}{}

	// Extract nodes summary
	if nodes, ok := defMap["nodes"].([]interface{}); ok {
		nodeSummaries := make([]map[string]interface{}, 0, len(nodes))
		for _, n := range nodes {
			node, ok := n.(map[string]interface{})
			if !ok {
				continue
			}
			ns := map[string]interface{}{
				"id":   node["id"],
				"type": node["type"],
			}
			if data, ok := node["data"].(map[string]interface{}); ok {
				if label, ok := data["label"]; ok {
					ns["label"] = label
				}
				if nodeType, ok := data["type"]; ok {
					ns["node_type"] = nodeType
				}
			}
			nodeSummaries = append(nodeSummaries, ns)
		}
		summary["nodes"] = nodeSummaries
		summary["node_count"] = len(nodes)
	}

	// Extract edges count
	if edges, ok := defMap["edges"].([]interface{}); ok {
		summary["edge_count"] = len(edges)
	}

	return summary
}
