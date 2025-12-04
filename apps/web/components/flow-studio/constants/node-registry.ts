import { ScheduleNode } from '../nodes/schedule-node';
import { ActionNode } from '../nodes/action-node';
import { ManualTriggerNode } from '../nodes/manual-trigger-node';
import { HttpRequestConfig } from '../configurators/http-request-config';
import { ManualTriggerConfig } from '../configurators/manual-trigger-config';
import { ScheduleTriggerConfig } from '../configurators/schedule-trigger-config';
import { ParseNodeConfig } from '../configurators/parse-node-config';
import { MapNodeConfig } from '../configurators/map-node-config';

export const NODE_TYPES = {
    schedule: ScheduleNode,
    action: ActionNode,
    'manual-trigger': ManualTriggerNode,
};

export const CONFIG_COMPONENTS: Record<string, any> = {
    'http': HttpRequestConfig,
    'manual-trigger': ManualTriggerConfig,
    'schedule': ScheduleTriggerConfig,
    'parse': ParseNodeConfig,
    'map': MapNodeConfig,
    // Fallbacks
    'action': HttpRequestConfig, // Default action to HTTP for now
};

export const ACTION_NAMES: Record<string, string> = {
    http: "HTTP Request",
    email: "Send Email",
    parse: "Parse Data",
    map: "Map Data",

    default: "Action",
    'manual-trigger': "Manual Trigger",
    schedule: "Schedule"
};

export const INITIAL_NODES = [];
