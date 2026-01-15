import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.search; // Includes '?'
    const url = `${BACKEND_URL}/${path}${searchParams}`;

    const body = request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.blob()
        : undefined;

    // Prepare headers:
    // 1. Remove 'host' to avoid SNI/VirtualHost mismatches at the destination (Cloudflare/Koyeb).
    // 2. Remove 'connection' to let the customized agent handle keep-alive.
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.delete('host');
    forwardedHeaders.delete('connection');

    try {
        const response = await fetch(url, {
            method: request.method,
            headers: forwardedHeaders,
            body,
            // 'duplex' is required for streaming bodies in Node.js environments (Next.js App Router).
            // It is not yet in the official TypeScript types for RequestInit, hence the ignore.
            // @ts-ignore
            duplex: 'half',
        });

        // Copy headers to a new object to avoid read-only issues.
        const responseHeaders = new Headers(response.headers);

        // Sanitize Response Headers:
        // 1. 'content-encoding': Node-fetch automatically decompresses the body. 
        //    Forwarding 'gzip' would cause the browser to fail decoding (double-decoding).
        // 2. 'content-length': Since we decompressed it, the length changed. Next.js will recalculate.
        // 3. 'transfer-encoding': Chunked encoding is handled by the Next.js framing.
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');
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
