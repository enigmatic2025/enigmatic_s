import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.search; // Includes '?'
    const url = `${BACKEND_URL}/${path}${searchParams}`;
    console.log(`[Proxy] Forwarding to: ${url}`);

    const body = request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.blob()
        : undefined;

    try {
        const response = await fetch(url, {
            method: request.method,
            headers: request.headers,
            body,
            // @ts-ignore
            duplex: 'half',
        });

        // Copy headers to a new object to avoid read-only issues
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('X-Debug-Target-Url', url);
        responseHeaders.set('X-Debug-Backend-Env', BACKEND_URL);

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ 
            error: 'Failed to proxy request',
            debug_url: url,
            debug_env: BACKEND_URL 
        }, { 
            status: 500,
            headers: {
                'X-Debug-Target-Url': url,
                'X-Debug-Backend-Env': BACKEND_URL
            }
        });
    }
}

export async function GET(request: NextRequest, ctx: any) {
    return proxy(request, ctx);
}

export async function POST(request: NextRequest, ctx: any) {
    return proxy(request, ctx);
}

export async function PUT(request: NextRequest, ctx: any) {
    return proxy(request, ctx);
}

export async function DELETE(request: NextRequest, ctx: any) {
    return proxy(request, ctx);
}
