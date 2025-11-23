import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(request, path);
}

async function proxyRequest(request: NextRequest, path: string[]) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';
    const url = `${backendUrl}/${path.join('/')}`;

    // Forward headers
    const headers = new Headers(request.headers);
    headers.set('host', new URL(backendUrl).host);

    // Add Internal Secret if needed
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret) {
        headers.set('X-Internal-Secret', internalSecret);
    }

    try {
        const body = request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null;

        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: body,
            // @ts-ignore - duplex is needed for streaming bodies in some node versions, though fetch types might complain
            duplex: 'half'
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 502 });
    }
}
