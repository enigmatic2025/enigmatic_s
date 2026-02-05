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
    // Strict pattern for the usage inside: steps.NODE.body.FIELD
    // No spaces allowed inside the variable name itself, and it must match exactly.
    // We allow surrounding whitespace INSIDE the brackets, e.g. {{ steps.foo.body.bar }} is valid.

    // OLD STRICT: /^\s*steps\.([a-zA-Z0-9_-]+)(?:\.body\.([a-zA-Z0-9_-]+))?\s*$/
    // NEW RELAXED (Previous): /^\s*steps\.([a-zA-Z0-9_-]+)(?:\.([a-zA-Z0-9_.-]+))?\s*$/

    // ROBUST: Allows dot or bracket notation for the path suffix.
    // Capture Group 1: Node ID
    // Capture Group 2: The path suffix (starting with . or [)
    const strictVarRegex = /^\s*steps\.([a-zA-Z0-9_-]+)((?:[\.\[].+)?)?\s*$/;

    for (const match of matches) {
        const rawContent = match[1]; // " steps.trigger.body.driver "

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
        const pathSuffix = varMatch[2] || ""; // e.g. ".body.driver", "['key']", ".yesno"

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
        // Only validate against schema if we are accessing the "body" of the trigger
        if (isReachable && nodeRef === 'trigger' && pathSuffix && triggerSchemaKeys) {
            // We only validate if the path strictly starts with ".body." to avoid false positives on brackets or other fields
            if (pathSuffix.startsWith('.body.')) {
                // Extract the first property after body.
                // e.g. .body.address.city -> address
                // e.g. .body.id -> id
                const pathAfterBody = pathSuffix.substring(6); // remove ".body."

                // Get the first segment (stop at dot or bracket)
                const firstSegmentMatch = pathAfterBody.match(/^([a-zA-Z0-9_-]+)/);

                if (firstSegmentMatch) {
                    const rootField = firstSegmentMatch[1];
                    if (!triggerSchemaKeys.has(rootField)) {
                        // We only invalid if it's explicitly missing from the body schema
                        invalidFields.push(rootField);
                    }
                }
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
