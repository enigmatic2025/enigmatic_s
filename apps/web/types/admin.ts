export interface Organization {
    id: string
    name: string
    slug: string
    plan: string
    subscription_plan?: string
    ai_credits_balance?: number
    ai_unlimited_access?: boolean
    total_tokens_used?: number
    total_credits_used?: number
    total_requests?: number
    created_at?: string
}

export interface User {
    id: string
    email: string
    full_name: string
    system_role: 'platform_admin' | 'user'
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
