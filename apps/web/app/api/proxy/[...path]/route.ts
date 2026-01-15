import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.search; // Includes '?'
    const url = `${BACKEND_URL}/${path}${searchParams}`;
    const url = `${BACKEND_URL}/${path}${searchParams}`;

    const body = request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.blob()
        : undefined;

    // Prepare headers: Remove 'host' to avoid SNI/VirtualHost mismatches at Koyeb/Cloudflare
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.delete('host');
    forwardedHeaders.delete('connection'); // Let the agent handle connection

    try {
        const response = await fetch(url, {
            method: request.method,
            headers: forwardedHeaders,
            body,
            // @ts-ignore
            duplex: 'half',
        });

        // Copy headers to a new object to avoid read-only issues
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding'); // Fetch implementation decodes body, so we must remove this
        responseHeaders.delete('content-length');   // Let Next.js recalculate length
        responseHeaders.delete('transfer-encoding');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
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
