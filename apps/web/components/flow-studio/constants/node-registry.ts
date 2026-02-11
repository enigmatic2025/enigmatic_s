import { ActionNode } from '../nodes/action-node';
import { ManualTriggerNode } from '../nodes/manual-trigger-node';
import { HttpRequestConfig } from '../configurators/http-request-config';
import { ManualTriggerConfig } from '../configurators/manual-trigger-config';
// import { ScheduleTriggerConfig } from '../configurators/schedule-trigger-config';
import { ConditionNode } from '../nodes/condition-node';
import { ConditionConfig } from '../configurators/condition-config';
import { FilterConfig } from '../configurators/filter-config';
import { LoopNode } from '../nodes/loop-node';
import { LoopConfig } from '../configurators/loop-config';
import { VariableNode } from '../nodes/variable-node';
import { VariableConfig } from '../configurators/variable-config';
import { SwitchNode } from '../nodes/switch-node';
import { SwitchConfig } from '../configurators/switch-config';
import { MapConfig } from '../configurators/map-config';
import ApiTriggerNode from '../nodes/api-trigger-node';
import ApiTriggerConfig from '../configurators/api-trigger-config';
import { HumanTaskNode } from '../nodes/human-task-node';
import { HumanTaskConfig } from '../configurators/human-task-config';
import { GotoNode } from '../nodes/goto-node';
import { GotoConfig } from '../configurators/goto-config';
import { AutomationNode } from '../nodes/automation-node';
import { AutomationConfig } from '../configurators/automation-config';

export const NODE_TYPES = {
    // schedule: ScheduleNode,
    action: ActionNode,
    'manual-trigger': ManualTriggerNode,
    'api-trigger': ApiTriggerNode,
    condition: ConditionNode,
    loop: LoopNode,
    variable: VariableNode,
    switch: SwitchNode,
    'human-task': HumanTaskNode,
    'goto': GotoNode,
    'automation': AutomationNode,
};

export const CONFIG_COMPONENTS: Record<string, any> = {
    'http': HttpRequestConfig,
    'manual-trigger': ManualTriggerConfig,
    // 'schedule': ScheduleTriggerConfig,
    'api-trigger': ApiTriggerConfig,
    'condition': ConditionConfig,
    'filter': FilterConfig,
    'loop': LoopConfig,
    'variable': VariableConfig,
    'switch': SwitchConfig,
    'map': MapConfig,
    'human-task': HumanTaskConfig,
    'goto': GotoConfig,
    'automation': AutomationConfig,

    // Fallbacks
    'action': HttpRequestConfig, // Default action to HTTP for now
};

export const NODE_METADATA: Record<string, { title: string; description: string }> = {
    'http': {
        title: "HTTP Request",
        description: "Send an HTTP request to any API endpoint or service."
    },
    'api-trigger': {
        title: "Incoming Webhook",
        description: "Starts a new flow run when data is received via the generated URL."
    },
    'manual-trigger': {
        title: "Manual Trigger",
        description: "Start the flow manually from the dashboard for testing."
    },
    'condition': {
        title: "Condition",
        description: "Branch the flow based on logical rules (If/Else)."
    },
    'filter': {
        title: "Filter Data",
        description: "Stop the flow execution if conditions are not met."
    },
    'loop': {
        title: "Loop",
        description: "Iterate over a list of items and run steps for each."
    },
    'variable': {
        title: "Set Variable",
        description: "Create or update a variable for use in later steps."
    },
    'switch': {
        title: "Switch",
        description: "Route the flow into different paths based on values."
    },
    'map': {
        title: "Map Data",
        description: "Transform data structures from one format to another."
    },
    'human-task': {
        title: "Human Task",
        description: "Pause the flow and wait for human approval or input."
    },
    'goto': {
        title: "Goto / Jump",
        description: "Jump to another step in the flow."
    },
    'automation': {
        title: "Wait for Event",
        description: "Pause flow and wait for external API call."
    },

    // Fallback
    'action': {
        title: "Action",
        description: "Perform a generic action."
    }
};

export const ACTION_NAMES: Record<string, string> = {
    http: "HTTP Request",
    email: "Send Email",
    condition: "Condition (If/Else)",
    filter: "Filter Data",
    loop: "Loop (For Each)",
    variable: "Set Variable",
    switch: "Switch (Case)",
    map: "Map Data (Transform)",
    default: "Action",
    'manual-trigger': "Manual Trigger",
    'api-trigger': "Incoming Webhook",
    'human-task': "Human Task",
    'automation': "Wait for Event"
};

export const INITIAL_NODES = [];
