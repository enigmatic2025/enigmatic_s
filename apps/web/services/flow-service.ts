const API_BASE_URL = 'http://localhost:8001';

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

    async testAction(nodeData: any) {
        // Mock implementation for now
        // In a real app, this would call a backend endpoint like POST /flows/test-action
        console.log("Testing action with data:", nodeData);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "Action executed successfully",
                        received_config: nodeData
                    },
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        });
    }
};
