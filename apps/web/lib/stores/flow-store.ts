import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface FlowStore {
    nodes: Node[];
    edges: Edge[];
    variables: Record<string, any>;
    syncNodes: (nodes: Node[]) => void;
    syncEdges: (edges: Edge[]) => void;
    setVariable: (key: string, value: any) => void;
    deleteVariable: (key: string) => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
    nodes: [],
    edges: [],
    variables: {},
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
}));
