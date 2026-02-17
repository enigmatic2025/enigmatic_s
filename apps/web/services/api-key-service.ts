import { apiClient } from "@/lib/api-client";

export interface ApiKey {
    id: string;
    label: string | null;
    last_used_at: string | null;
    created_at: string;
}

export interface CreateApiKeyResponse {
    id: string;
    key: string;
    label: string;
}

export const apiKeyService = {
    getKeys: async (orgId: string): Promise<ApiKey[]> => {
        const res = await apiClient.get(`/api/orgs/${orgId}/api-keys`);
        if (!res.ok) throw new Error("Failed to fetch API keys");
        return res.json();
    },

    createKey: async (orgId: string, data: { label: string }): Promise<CreateApiKeyResponse> => {
        const res = await apiClient.post(`/api/orgs/${orgId}/api-keys`, data);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to create API key");
        }
        return res.json();
    },

    deleteKey: async (orgId: string, keyId: string): Promise<void> => {
        const res = await apiClient.delete(`/api/orgs/${orgId}/api-keys/${keyId}`);
        if (!res.ok) throw new Error("Failed to delete API key");
    },
};
