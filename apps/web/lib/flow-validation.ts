import { Node, Edge } from 'reactflow';
import { toast } from "sonner";

/**
 * Validates the flow structure before saving.
 * Rules:
 * 1. Exactly one Trigger (Schedule) node.
 * 2. At least one Action node.
 * 3. All nodes must be reachable from the Trigger (no orphans).
 */
export const validateFlow = (nodes: Node[], edges: Edge[]): boolean => {
    const triggerNodes = nodes.filter(n => n.type === 'schedule');
    const actionNodes = nodes.filter(n => n.type !== 'schedule');

    // 1. Check Trigger Count
    if (triggerNodes.length !== 1) {
        toast.error("Flow must have exactly one Trigger (Schedule).");
        return false;
    }

    // 2. Check Action Count
    if (actionNodes.length < 1) {
        toast.error("Flow must have at least one Action.");
        return false;
    }

    // 3. Check for Orphans (Reachability BFS)
    const startNodeId = triggerNodes[0].id;
    const visited = new Set<string>([startNodeId]);
    const queue = [startNodeId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        // Find all outgoing edges from current node
        const outgoingEdges = edges.filter(e => e.source === currentId);

        for (const edge of outgoingEdges) {
            if (!visited.has(edge.target)) {
                visited.add(edge.target);
                queue.push(edge.target);
            }
        }
    }

    if (visited.size !== nodes.length) {
        const orphanCount = nodes.length - visited.size;
        toast.error(`Found ${orphanCount} orphaned node(s) not connected to the trigger.`);
        return false;
    }

    return true;
};
