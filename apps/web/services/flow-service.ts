// Use local proxy to avoid CORS and hide backend URL
const API_BASE_URL = '/api/proxy';

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
        const res = await fetch(`${API_BASE_URL}/flows/${flowId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch flow");
        }
        return res.json();
    },

    async saveFlow(flowId: string | undefined, flowData: FlowData) {
        const url = flowId
            ? `${API_BASE_URL}/flows/${flowId}`
            : `${API_BASE_URL}/flows`;

        const method = flowId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flowData),
        });

        if (!response.ok) {
            throw new Error('Failed to save flow');
        }

        return response.json();
    },

    async deleteFlow(flowId: string) {
        const response = await fetch(`${API_BASE_URL}/flows/${flowId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete flow');
        }

        return response.json();
    },

    async renameFlow(flowId: string, name: string) {
        const response = await fetch(`${API_BASE_URL}/flows/${flowId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

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

        const response = await fetch(`${API_BASE_URL}/api/test/node`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Test failed: ${errorText}`);
        }

        return response.json();
    },

    async testFlow(flowDefinition: any, flowId?: string) {
        const response = await fetch(`${API_BASE_URL}/api/test/flow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                flow_definition: flowDefinition,
                flow_id: flowId
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Flow test failed: ${errorText}`);
        }

        return response.json();
    },

    async getFlowResult(workflowId: string, runId: string) {
        const response = await fetch(`${API_BASE_URL}/api/test/flow/${runId}?workflow_id=${workflowId}`);
        if (!response.ok) {
            // verification: avoid throwing if it's just not found yet (race condition), but 404 usually means not found.
            // Let's just return null or throw.
            return null;
        }
        return response.json();
    },

    async cancelFlow(workflowId: string, runId: string) {
        const response = await fetch(`${API_BASE_URL}/api/test/flow/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workflow_id: workflowId, run_id: runId }),
        });

        if (!response.ok) {
            throw new Error('Failed to cancel flow');
        }
        return response.json();
    },

    async publishFlow(flowId: string) {
        const response = await fetch(`${API_BASE_URL}/flows/${flowId}/publish`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to publish flow');
        }
        return response.json();
    }
};
