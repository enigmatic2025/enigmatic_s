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
    const triggerNodes = nodes.filter(n =>
        n.type === 'schedule' ||
        n.type === 'manual-trigger' ||
        n.type === 'api-trigger'
    );
    const actionNodes = nodes.filter(n => !triggerNodes.includes(n));

    // 1. Check Trigger Count
    if (triggerNodes.length !== 1) {
        toast.error("Flow must have exactly one Trigger (e.g. Schedule, Webhook).");
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

    const validNodeIds = new Set(nodes.map(n => n.id));

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        // Find all outgoing edges from current node
        const outgoingEdges = edges.filter(e => e.source === currentId);

        for (const edge of outgoingEdges) {
            // Only follow edges that point to existing nodes
            if (validNodeIds.has(edge.target) && !visited.has(edge.target)) {
                visited.add(edge.target);
                queue.push(edge.target);
            }
        }
    }

    // 4. Check Node Configuration
    for (const node of nodes) {
        // Generic Checks (Global)
        if (!node.data.label) {
            toast.error(`A node matches ID ${node.id} but is missing a Label.`);
            return false;
        }
        if (!node.data.description) {
            toast.error(`Node "${node.data.label}" is missing a Description.`);
            return false;
        }

        // Human Task
        if (node.type === 'human-task') {
            if (!node.data.assignee) {
                toast.error(`Node "${node.data.title || node.data.label}" is missing an Assignee.`);
                return false;
            }
        }

        // API Trigger
        if (node.type === 'api-trigger') {
            if (!node.data.instanceNameTemplate) {
                toast.error(`Trigger "${node.data.label}" is missing an Action Flow Title Template.`);
                return false;
            }
        }

        // Action Nodes
        if (node.type === 'action') {
            const subtype = node.data.subtype || 'http';

            if (subtype === 'http') {
                if (!node.data.url) {
                    toast.error(`Node "${node.data.label}" is missing a URL.`);
                    return false;
                }
                if (!node.data.method) {
                    // Should have a default, but checking just in case
                    // Actually, usually defaults to GET in config, but let's be strict if it's potentially empty
                }
            }

            if (subtype === 'email') {
                if (!node.data.to) {
                    toast.error(`Node "${node.data.label}" is missing a Recipient (To).`);
                    return false;
                }
            }
        }

        // Variable Nodes
        if (node.type === 'variable') {
            if (!node.data.variableName) {
                toast.error(`Node "${node.data.label}" is missing a Variable Name.`);
                return false;
            }
            if (node.data.value === undefined || node.data.value === '') {
                toast.error(`Node "${node.data.label}" is missing a Value.`);
                return false;
            }
        }

        // Switch Logic
        if (node.type === 'switch') {
            if (!node.data.variable) {
                toast.error(`Switch Node "${node.data.label}" is missing a Variable to Check.`);
                return false;
            }
        }

        // Loop Logic
        if (node.type === 'loop') {
            if (!node.data.items) {
                toast.error(`Loop Node "${node.data.label}" is missing an Array to Loop Over.`);
                return false;
            }
        }

        // Condition Logic
        if (node.type === 'condition') {
            const c = node.data.condition || {};
            if (!c.left || !c.operator || !c.right) {
                toast.error(`Condition Node "${node.data.label}" is incomplete (Left, Operator, and Right values required).`);
                return false;
            }
        }

        // Filter Logic
        if (node.type === 'filter') {
            const s = node.data.settings || {};
            if (!s.arrayVariable) {
                toast.error(`Filter Node "${node.data.label}" is missing an Array to Filter.`);
                return false;
            }
        }
    }

    if (visited.size !== nodes.length) {
        const orphanCount = nodes.length - visited.size;
        console.log("Validation Failed: Orphans found", {
            totalNodes: nodes.length,
            visitedNodes: visited.size,
            nodes: nodes.map(n => n.id),
            visited: Array.from(visited)
        });
        toast.error(`Found ${orphanCount} orphaned node(s) not connected to the trigger.`);
        return false;
    }

    console.log("Validation Passed");
    return true;
};
