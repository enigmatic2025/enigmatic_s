import { apiClient } from "@/lib/api-client";

export interface OrganizationMember {
    user_id: string;
    role: string;
    profiles: {
        full_name: string;
        email: string;
        system_role: string;
    };
}

export interface Team {
    id: string;
    org_id: string;
    name: string;
    description: string;
    created_at: string;
    member_count?: number; // Optional until backend supports it fully
}

export const organizationService = {
    getMembers: async (orgId: string): Promise<OrganizationMember[]> => {
        // Note: apiClient automatically handles /api prefix if we use the helper logic, 
        // but our client logic above handles endpoints starting with /api correctly too.
        // Let's pass the relative path without /api to rely on apiClient's base url logic
        // OR pass full path if that's what apiClient expects. 
        // Our apiClient implementation checks: "endpoint.startsWith('/api') ? endpoint : url"
        // So passing full path works.
        const res = await apiClient.get(`/api/orgs/${orgId}/members`);
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
    },

    getTeams: async (orgId: string): Promise<Team[]> => {
        const res = await apiClient.get(`/api/orgs/${orgId}/teams`);
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
    },

    createTeam: async (orgId: string, data: { name: string; description: string }): Promise<Team> => {
        const res = await apiClient.post(`/api/orgs/${orgId}/teams`, data);
        if (!res.ok) throw new Error("Failed to create team");
        return res.json();
    },
};
