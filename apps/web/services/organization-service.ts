import { apiClient } from "@/lib/api-client";

export interface MemberTeam {
    team_id: string;
    team_name: string;
    role: string;
}

export interface OrganizationMember {
    id: string;
    user_id: string;
    role: string;
    status: string;
    job_title: string | null;
    supervisor_id: string | null;
    supervisor_name: string | null;
    teams: MemberTeam[];
    profiles: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        system_role: string;
    };
}

export interface Team {
    id: string;
    org_id: string;
    name: string;
    description: string;
    created_at: string;
    member_count?: number;
    supervisor_count?: number;
}

export interface TeamMember {
    team_id: string;
    user_id: string;
    role: string;
    assigned_at: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

export const organizationService = {
    // ─── Members ────────────────────────────────────────
    getMembers: async (orgId: string): Promise<OrganizationMember[]> => {
        const res = await apiClient.get(`/api/orgs/${orgId}/members`);
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
    },

    createMember: async (orgId: string, data: {
        email: string;
        password: string;
        full_name: string;
        role: string;
        supervisor_id?: string;
        job_title?: string;
    }): Promise<{ status: string; user_id: string }> => {
        const res = await apiClient.post(`/api/orgs/${orgId}/members`, data);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to create member");
        }
        return res.json();
    },

    updateMember: async (orgId: string, userId: string, data: {
        role?: string;
        supervisor_id?: string | null;
        status?: string;
        job_title?: string;
    }): Promise<void> => {
        const res = await apiClient.patch(`/api/orgs/${orgId}/members/${userId}`, data);
        if (!res.ok) throw new Error("Failed to update member");
    },

    removeMember: async (orgId: string, userId: string): Promise<void> => {
        const res = await apiClient.delete(`/api/orgs/${orgId}/members/${userId}`);
        if (!res.ok) throw new Error("Failed to remove member");
    },

    // ─── Teams ──────────────────────────────────────────
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

    updateTeam: async (orgId: string, teamId: string, data: { name?: string; description?: string }): Promise<void> => {
        const res = await apiClient.patch(`/api/orgs/${orgId}/teams/${teamId}`, data);
        if (!res.ok) throw new Error("Failed to update team");
    },

    deleteTeam: async (orgId: string, teamId: string): Promise<void> => {
        const res = await apiClient.delete(`/api/orgs/${orgId}/teams/${teamId}`);
        if (!res.ok) throw new Error("Failed to delete team");
    },

    // ─── Team Members ───────────────────────────────────
    getTeamMembers: async (orgId: string, teamId: string): Promise<TeamMember[]> => {
        const res = await apiClient.get(`/api/orgs/${orgId}/teams/${teamId}/members`);
        if (!res.ok) throw new Error("Failed to fetch team members");
        return res.json();
    },

    addTeamMember: async (orgId: string, teamId: string, data: { user_id: string; role?: string }): Promise<void> => {
        const res = await apiClient.post(`/api/orgs/${orgId}/teams/${teamId}/members`, data);
        if (!res.ok) throw new Error("Failed to add team member");
    },

    removeTeamMember: async (orgId: string, teamId: string, userId: string): Promise<void> => {
        const res = await apiClient.delete(`/api/orgs/${orgId}/teams/${teamId}/members/${userId}`);
        if (!res.ok) throw new Error("Failed to remove team member");
    },

    updateTeamMemberRole: async (orgId: string, teamId: string, userId: string, role: string): Promise<void> => {
        const res = await apiClient.patch(`/api/orgs/${orgId}/teams/${teamId}/members/${userId}`, { role });
        if (!res.ok) throw new Error("Failed to update team member role");
    },
};
