import { useCallback } from 'react';
import {
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import { INITIAL_NODES } from '../constants/node-registry';

export function useFlowState(initialNodesList: Node[] = INITIAL_NODES) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesList);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge({ ...params, animated: true }, eds));
        },
        [setEdges],
    );

    return {
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        onConnect,
    };
}
