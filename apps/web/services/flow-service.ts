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
    }
};
