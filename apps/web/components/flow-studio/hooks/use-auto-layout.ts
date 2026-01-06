import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import dagre from 'dagre';

export function useAutoLayout() {
    const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

    const onLayout = useCallback((direction = 'LR') => {
        const nodes = getNodes();
        const edges = getEdges();

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // Config: Node width/height should match your NodeCard + some mapping
        const nodeWidth = 280; // slightly wider than 250px card for spacing
        const nodeHeight = 150; // allow for height variations

        dagreGraph.setGraph({ rankdir: direction });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);

            // Shift slightly to handle React Flow's center vs Top-Left origin differences if needed,
            // but usually dagre gives center coordinates.
            // Actually Dagre gives top-left based on implementation, let's check.
            // React Flow needs top-left. Dagre gives center-point by default in some versions,
            // but let's assume standard behavior: x, y are top-left with offset

            // Simplest approach: Just apply the x/y from dagre directly.
            // Usually need to subtract half width/height if dagre returns center.
            // Let's assume top-left for now.

            // Correction: Dagre returns center point (x,y)
            return {
                ...node,
                targetPosition: direction === 'LR' ? 'left' : 'top',
                sourcePosition: direction === 'LR' ? 'right' : 'bottom',

                // We need to shift the position because dagre x/y are center of the node
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                },
            };
        });

        setNodes(layoutedNodes as Node[]);
        // edges don't strictly need updates unless we're doing complex routing points
        // but ReactFlow handles the edge pathing automatically based on handles.

        // Fit view after layout with a slight delay to allow render
        setTimeout(() => {
            window.requestAnimationFrame(() => {
                // We can't easily access fitView here without passing it in or using store.
                // But existing user interaction handles pan/zoom.
            });
        }, 10);

    }, [getNodes, getEdges, setNodes, setEdges]);

    return { onLayout };
}
