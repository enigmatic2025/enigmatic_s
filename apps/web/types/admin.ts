export interface Organization {
    id: string
    name: string
    slug: string
    plan: string
    subscription_plan?: string // Handling potential inconsistency
    ai_credits_balance?: number // AI credits balance
    ai_unlimited_access?: boolean // Unlimited AI access flag
    created_at?: string
}

export interface User {
    id: string
    email: string
    full_name: string
    system_role: 'admin' | 'member' | 'user'
    organization_id?: string
    blocked?: boolean
    created_at?: string
    memberships?: {
        org_id: string
        role: string
        organizations: {
            name: string
        }
    }[]
}

export interface MFAFactor {
    id: string
    friendly_name?: string
    factor_type: 'totp'
    status: 'verified' | 'unverified'
    created_at: string
    updated_at: string
}

export interface AuthSession {
    access_token: string
    refresh_token: string
    user: User
}
