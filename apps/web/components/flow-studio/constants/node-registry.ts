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
    // Fallbacks
    'action': HttpRequestConfig, // Default action to HTTP for now
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
    // schedule: "Schedule"
};

export const INITIAL_NODES = [];
