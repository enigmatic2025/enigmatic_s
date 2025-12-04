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
            // Check if target is a Parse Node and already has an input
            const targetNode = nodes.find(n => n.id === params.target);
            if (targetNode?.data?.subtype === 'parse') {
                const hasInput = edges.some(e => e.target === params.target);
                if (hasInput) {
                    // toast.error("Parse Node can only have one input source"); // Toast not available here easily without prop drilling or context
                    console.warn("Parse Node can only have one input source");
                    return;
                }
            }
            setEdges((eds) => addEdge({ ...params, animated: true }, eds));
        },
        [setEdges, nodes, edges],
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
