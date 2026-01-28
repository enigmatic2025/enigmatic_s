import { apiClient } from "@/lib/api-client";

// API_BASE_URL handled by apiClient

export interface FlowData {
    org_id: string;
    slug: string;
    name: string;
    description: string;
    definition: any;
    variables_schema: any[];
}

export const flowService = {
    async getFlow(flowId: string) {
        const res = await apiClient.get(`/flows/${flowId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch flow");
        }
        return res.json();
    },

    async saveFlow(flowId: string | undefined, flowData: FlowData) {
        const url = flowId
            ? `/flows/${flowId}`
            : `/flows`;

        let response;
        if (flowId) {
            response = await apiClient.put(url, flowData);
        } else {
            response = await apiClient.post(url, flowData);
        }

        if (!response.ok) {
            throw new Error('Failed to save flow');
        }

        return response.json();
    },

    async deleteFlow(flowId: string) {
        const response = await apiClient.delete(`/flows/${flowId}`);

        if (!response.ok) {
            throw new Error('Failed to delete flow');
        }

        return response.json();
    },

    async renameFlow(flowId: string, name: string) {
        const response = await apiClient.put(`/flows/${flowId}`, { name });

        if (!response.ok) {
            throw new Error('Failed to rename flow');
        }

        return response.json();
    },

    async testAction(nodeData: any, context: any = {}) {
        // nodeData usually comes from the React Flow node object
        // We need to transform it into what the backend expects: { type, config, input }

        const payload = {
            type: nodeData.data?.subtype || nodeData.data?.type || nodeData.type,
            config: nodeData.data || {},
            input: {
                // For testing, we can pass some mock input or the body from the test tab
                ...nodeData.data,
                ...nodeData.input, // If we have input simulation later
                ...context         // Inject global context (e.g. { steps: ... })
            }
        };

        const response = await apiClient.post(`/test/node`, payload);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Test failed: ${errorText}`);
        }

        return response.json();
    },

    async testFlow(flowDefinition: any, flowId?: string, inputPayload?: any) {
        const response = await apiClient.post(`/test/flow`, {
            flow_definition: flowDefinition,
            flow_id: flowId,
            input: inputPayload
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Flow test failed: ${errorText}`);
        }

        return response.json();
    },

    async getFlowResult(workflowId: string, runId: string) {
        const response = await apiClient.get(`/test/flow/${runId}?workflow_id=${workflowId}`);
        if (!response.ok) {
            // verification: avoid throwing if it's just not found yet (race condition), but 404 usually means not found.
            // Let's just return null or throw.
            return null;
        }
        return response.json();
    },

    async cancelFlow(workflowId: string, runId: string) {
        const response = await apiClient.post(`/test/flow/cancel`, { workflow_id: workflowId, run_id: runId });

        if (!response.ok) {
            throw new Error('Failed to cancel flow');
        }
        return response.json();
    },

    async publishFlow(flowId: string) {
        const response = await apiClient.post(`/flows/${flowId}/publish`, {});

        if (!response.ok) {
            throw new Error('Failed to publish flow');
        }
        return response.json();
    },

    async getActionFlow(id: string) {
        // Use generic handler for get to bypass cache logic if needed, or pass options?
        // apiClient.fetch handles options.
        const response = await apiClient.fetch(`/action-flows/${id}`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to fetch action flow details');
        }
        return response.json();
    }
};
