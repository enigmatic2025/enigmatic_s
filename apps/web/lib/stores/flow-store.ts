import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface ExecutionResult {
    nodeId: string;
    status: 'success' | 'error' | 'running' | 'pending';
    duration?: number;
    error?: string;
    input?: any;
    output?: any;
    timestamp?: number;
}

export interface LogEntry {
    id?: string;
    timestamp?: number;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    details?: any;
}

interface FlowStore {
    nodes: Node[];
    edges: Edge[];
    variables: Record<string, any>;
    executionTrace: Record<string, ExecutionResult>;
    logs: LogEntry[];
    syncNodes: (nodes: Node[]) => void;
    syncEdges: (edges: Edge[]) => void;
    setVariable: (key: string, value: any) => void;
    deleteVariable: (key: string) => void;
    setExecutionTrace: (trace: Record<string, ExecutionResult>) => void;
    clearExecutionTrace: () => void;
    clearVariables: () => void;
    addLog: (log: LogEntry) => void;
    clearLogs: () => void;
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    editingNodeId: string | null;
    editingNodeData: any | null;
    setEditingNode: (id: string | null, data: any | null) => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
    nodes: [],
    edges: [],
    variables: {},
    executionTrace: {},
    logs: [],
    syncNodes: (nodes) => set({ nodes }),
    syncEdges: (edges) => set({ edges }),
    setVariable: (key, value) => set((state) => ({
        variables: { ...state.variables, [key]: value }
    })),
    deleteVariable: (key) => set((state) => {
        const newVars = { ...state.variables };
        delete newVars[key];
        return { variables: newVars };
    }),
    setExecutionTrace: (trace) => set({ executionTrace: trace }),
    clearExecutionTrace: () => set({ executionTrace: {} }),
    clearVariables: () => set({ variables: {} }),
    addLog: (log) => set((state) => ({
        logs: [...state.logs, { ...log, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
    })),
    clearLogs: () => set({ logs: [] }),
    selectedNodeId: null,
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    editingNodeId: null,
    editingNodeData: null,
    setEditingNode: (id, data) => set({ editingNodeId: id, editingNodeData: data }),
}));
