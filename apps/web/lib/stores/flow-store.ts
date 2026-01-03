import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface FlowStore {
    nodes: Node[];
    edges: Edge[];
    syncNodes: (nodes: Node[]) => void;
    syncEdges: (edges: Edge[]) => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
    nodes: [],
    edges: [],
    syncNodes: (nodes) => set({ nodes }),
    syncEdges: (edges) => set({ edges }),
}));
