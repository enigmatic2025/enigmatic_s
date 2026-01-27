
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
        const res = await fetch(`/api/orgs/${orgId}/members`);
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
    },

    getTeams: async (orgId: string): Promise<Team[]> => {
        const res = await fetch(`/api/orgs/${orgId}/teams`);
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
    },

    createTeam: async (orgId: string, data: { name: string; description: string }): Promise<Team> => {
        const res = await fetch(`/api/orgs/${orgId}/teams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create team");
        return res.json();
    },
};
