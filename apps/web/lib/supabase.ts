import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: true,
            storageKey: 'nodal-auth',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    }
)

/** Shape returned by `select('organizations(slug)')` on the memberships table. */
interface MembershipWithOrg {
    organizations: { slug: string } | null
}

/**
 * Fetches the first org slug for the current user.
 * Returns the slug string or null if the user has no memberships.
 */
export async function getUserOrgSlug(): Promise<string | null> {
    const { data } = await supabase
        .from('memberships')
        .select('organizations(slug)')
        .limit(1)

    const memberships = data as MembershipWithOrg[] | null
    if (memberships && memberships.length > 0 && memberships[0].organizations) {
        return memberships[0].organizations.slug
    }
    return null
}
