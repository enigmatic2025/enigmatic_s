import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const url = `${BACKEND_URL}/${path}`;

    const body = request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.blob()
        : undefined;

    try {
        const response = await fetch(url, {
            method: request.method,
            headers: request.headers,
            body,
            // @ts-ignore - duplex is needed for streaming bodies in some node versions, though standard fetch doesn't type it
            duplex: 'half',
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
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
