import { useMemo } from 'react';
import { Node, Edge } from 'reactflow';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    invalidNodes: string[];
    invalidFields: string[];
}

export function validateVariableReferences(
    text: string | undefined,
    currentNodeId: string,
    nodes: Node[],
    edges: Edge[]
): ValidationResult {
    if (!text) return { isValid: true, errors: [], invalidNodes: [], invalidFields: [] };

    const invalidNodes: string[] = [];
    const invalidFields: string[] = [];
    const errors: string[] = [];

    // 1. Build Ancestor Map for Topology Check
    const validAncestorIds = new Set<string>();
    const queue = [currentNodeId];
    const visited = new Set<string>();

    // Work backwards from current node
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const incomingEdges = edges.filter(e => e.target === currentId);
        for (const edge of incomingEdges) {
            if (edge.source) {
                validAncestorIds.add(edge.source);
                queue.push(edge.source);
            }
        }
    }

    // 2. Find Trigger Schema (Global Context)
    const triggerNode = nodes.find(n => n.type === 'api-trigger');
    let triggerSchemaKeys: Set<string> | null = null;
    if (triggerNode?.data?.schema) {
        triggerSchemaKeys = new Set((triggerNode.data.schema as any[]).map(f => f.key));
    }

    // 3. Strict Parsing
    // Match anything within {{ }}
    const blockRegex = /\{\{([^}]+)\}\}/g;
    const matches = text.matchAll(blockRegex);

    // Strict pattern for the usage inside: steps.NODE.body.FIELD
    // No spaces allowed inside the variable name itself, and it must match exactly.
    // We allow surrounding whitespace INSIDE the brackets, e.g. {{ steps.foo.body.bar }} is valid.
    const strictVarRegex = /^\s*steps\.([a-zA-Z0-9_-]+)(?:\.body\.([a-zA-Z0-9_-]+))?\s*$/;

    for (const match of matches) {
        const rawContent = match[1]; // " steps.trigger.body.driver 2 "

        // Check if it fits the strict variable pattern
        const varMatch = rawContent.match(strictVarRegex);

        if (!varMatch) {
            // It failed strict matching.
            // If it LOOKS like a steps reference (starts with steps.), we flag it as Malformed/Syntax Error.
            if (rawContent.trim().startsWith('steps.')) {
                errors.push(`Invalid syntax near "${rawContent.trim()}". Check for spaces or typos.`);
                // We don't continue schema checks for this because we can't reliably parse it.
            }
            continue;
        }

        const nodeRef = varMatch[1];
        const fieldRef = varMatch[2];

        let effectiveNodeId = nodeRef;
        if (nodeRef === 'trigger' && triggerNode) {
            effectiveNodeId = triggerNode.id;
        }

        // A. Topology Validation
        // Valid if it's an ancestor OR it's the current node (self-ref) OR it's the special 'trigger' alias (if it exists)
        const isSelf = effectiveNodeId === currentNodeId;
        const isAncestor = validAncestorIds.has(effectiveNodeId);

        // Refined Check:
        let isReachable = isAncestor || isSelf;

        // Special case: If checking 'trigger' alias, we map to actual ID and check reachability
        if (nodeRef === 'trigger' && triggerNode) {
            // If I am the trigger, isSelf is true.
            // If I am downstream, trigger is ancestor.
            if (validAncestorIds.has(triggerNode.id) || triggerNode.id === currentNodeId) {
                isReachable = true;
            } else {
                isReachable = false;
            }
        } else if (nodeRef === 'trigger' && !triggerNode) {
            isReachable = false; // Trigger alias used but no trigger node exists
        }

        if (!isReachable) {
            invalidNodes.push(nodeRef);
        }

        // B. Schema Validation (Specific to Trigger Body for now)
        if (isReachable && nodeRef === 'trigger' && fieldRef && triggerSchemaKeys) {
            if (!triggerSchemaKeys.has(fieldRef)) {
                invalidFields.push(fieldRef);
            }
        }
    }

    // De-duplicate
    const uniqueNodes = Array.from(new Set(invalidNodes));
    const uniqueFields = Array.from(new Set(invalidFields));

    if (uniqueNodes.length > 0) {
        errors.push(`Reference to missing or future steps: ${uniqueNodes.join(', ')}`);
    }
    if (uniqueFields.length > 0) {
        errors.push(`Undefined schema fields: ${uniqueFields.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        invalidNodes: uniqueNodes,
        invalidFields: uniqueFields
    };
}

export function useVariableValidation(
    text: string | undefined,
    currentNodeId: string,
    nodes: Node[],
    edges: Edge[]
): ValidationResult {
    return useMemo(() => {
        return validateVariableReferences(text, currentNodeId, nodes, edges);
    }, [text, currentNodeId, nodes, edges]);
}
