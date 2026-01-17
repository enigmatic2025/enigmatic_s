import { useCallback } from 'react';
import { Node, useReactFlow, Edge } from 'reactflow';
import { toast } from "sonner";
import { flowService } from '@/services/flow-service';
import { validateFlow } from '@/lib/flow-validation';

const getId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

interface UseFlowOperationsProps {
    nodes: Node[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    edges: Edge[];
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    flowId?: string;
    flowName: string;
    setFlowName: (name: string) => void;
    slug: string;
    router: any;
    reactFlowWrapper: React.RefObject<HTMLDivElement | null>;
    setSelectedNode: (node: Node | null | ((prev: Node | null) => Node | null)) => void;
}

export function useFlowOperations({
    nodes,
    setNodes,
    edges,
    setEdges,
    flowId,
    flowName,
    setFlowName,
    slug,
    router,
    reactFlowWrapper,
    setSelectedNode,
}: UseFlowOperationsProps) {
    const { project } = useReactFlow();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowWrapper.current?.getBoundingClientRect();

            if (!position) return;

            const positionInstance = project({
                x: event.clientX - position.left,
                y: event.clientY - position.top,
            });

            const [nodeType, subtype] = type.split(':');

            // Validation: Must start with a Trigger
            const isTrigger = nodeType === 'schedule' || nodeType === 'manual-trigger' || nodeType === 'api-trigger';

            if (nodes.length === 0 && !isTrigger) {
                toast.error("The first node must be a Trigger (e.g. 'Trigger: Create Flow').");
                return;
            }

            // Validation: Only one Trigger allowed
            const hasTrigger = nodes.some(n => n.type === 'schedule' || n.type === 'manual-trigger' || n.type === 'api-trigger');
            if (isTrigger && hasTrigger) {
                toast.error("Only one Trigger is allowed per flow.");
                return;
            }

            // Unified Naming Scheme: "Untitled X"
            const baseName = "Untitled";
            let newLabel = baseName;

            const regex = new RegExp(`^${baseName} (\\d+)$`);
            let maxNum = 0;

            nodes.forEach(node => {
                const match = node.data.label.match(regex);
                if (match) {
                    const num = match[1] ? parseInt(match[1]) : 0;
                    if (num > maxNum) maxNum = num;
                }
            });

            newLabel = `${baseName} ${maxNum + 1}`;

            const newNode: Node = {
                id: getId(),
                type: nodeType,
                position: positionInstance,
                data: {
                    label: newLabel,
                    type: nodeType,
                    subtype: subtype
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [project, setNodes, nodes, reactFlowWrapper],
    );

    const onUpdateNode = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
        setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
    }, [setNodes, setSelectedNode]);

    const handleSave = async () => {
        if (!slug) return;

        if (flowName === "Untitled") {
            toast.error("Please rename the flow before saving.");
            return;
        }

        if (!validateFlow(nodes, edges)) {
            return;
        }

        // TODO: Get actual Org ID from context
        const orgId = "00000000-0000-0000-0000-000000000000";

        const flowData = {
            org_id: orgId,
            slug: slug,
            name: flowName,
            description: "Created via Flow Studio",
            definition: { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } },
            variables_schema: [],
        };

        try {
            const result = await flowService.saveFlow(flowId, flowData);
            toast.success("Flow saved successfully!");

            if (!flowId && result.id) {
                router.push(`/nodal/${slug}/dashboard/flow-studio/design/${result.id}`);
            }
        } catch (error: any) {
            console.error(error);
            if (error.message.includes("conflict") || error.message.includes("exists")) {
                toast.error("A flow with this name already exists.");
            } else {
                toast.error("Failed to save flow. Is the backend running?");
            }
        }
    };

    const handleDelete = async () => {
        if (!flowId) return;
        try {
            await flowService.deleteFlow(flowId);
            toast.success("Flow deleted successfully");
            router.push(`/nodal/${slug}/dashboard/flow-studio`);
        } catch (error) {
            toast.error("Failed to delete flow");
        }
    };

    return {
        onDragOver,
        onDrop,
        onUpdateNode,
        handleSave,
        handleDelete,
    };
}
