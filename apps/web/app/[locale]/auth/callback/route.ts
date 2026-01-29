import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/nodal/admin'

    const nextUrl = new URL(next, request.url)

    // Preserve the code parameter so the client can exchange it
    if (code) {
        nextUrl.searchParams.set('code', code)
    }

    return NextResponse.redirect(nextUrl)
}
