import { Node, Edge, Viewport } from 'reactflow';

// --- Core Flow Structure ---

export interface FlowDefinition {
    nodes: Node<NodeData>[];
    edges: Edge[];
    viewport: Viewport;
}

export interface Flow {
    id: string;
    org_id: string;
    name: string;
    description?: string;
    version: number;
    is_active: boolean;
    definition: FlowDefinition;
    variables_schema: VariableSchema[];
    created_at: string;
    updated_at: string;
}

// --- Node Data & Configuration ---

export type NodeType = 'schedule' | 'action' | 'ai' | 'human' | 'logic';

export interface NodeData {
    label: string;
    subtype?: string;
    description?: string;
    config?: NodeConfig;
    [key: string]: any; // Allow for React Flow internal data
}

export type NodeConfig =
    | ScheduleConfig
    | HTTPRequestConfig
    | AIReasoningConfig
    | HumanTaskConfig;

// --- Specific Node Configs ---

export interface ScheduleConfig {
    interval?: string; // e.g., "0 9 * * *" (Cron)
    timezone?: string;
}

export interface HTTPRequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: any;
}

export interface AIReasoningConfig {
    model: string;
    prompt: string;
    rag_knowledge_base_ids?: string[];
    output_schema?: Record<string, string>;
}

export interface HumanTaskConfig {
    assignee_mode: 'static' | 'dynamic';
    assignee_id?: string;
    form_schema?: FormField[];
}

export interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'file_upload';
    label: string;
    required?: boolean;
    options?: string[]; // For select
}

// --- Variables ---

export interface VariableSchema {
    key: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    default_value?: any;
}
