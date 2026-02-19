import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || ''

    // Get locale from the URL path (e.g., /vi/auth/callback)
    const pathSegments = requestUrl.pathname.split('/').filter(Boolean)
    const locale = pathSegments[0] || 'en'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // If a next path was provided (e.g., password reset), redirect there
            if (next) {
                return NextResponse.redirect(new URL(`/${locale}${next}`, request.url))
            }
            // Otherwise redirect to login page (which detects session and redirects to dashboard)
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
        }
    }

    // Fallback: redirect to login with locale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
}
