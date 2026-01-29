import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // Get locale from the URL path (e.g., /vi/auth/callback)
    const pathSegments = requestUrl.pathname.split('/').filter(Boolean)
    const locale = pathSegments[0] || 'en' // First segment is locale

    // Redirect to login page with code - login page will handle session exchange and org redirect
    if (code) {
        const loginUrl = `/${locale}/login?code=${code}`
        return NextResponse.redirect(new URL(loginUrl, request.url))
    }

    // Fallback: redirect to login with locale
    const fallbackUrl = `/${locale}/login`
    return NextResponse.redirect(new URL(fallbackUrl, request.url))
}
