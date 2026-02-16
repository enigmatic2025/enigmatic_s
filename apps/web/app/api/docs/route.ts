import { NextResponse } from 'next/server';
import { enDocs } from '@/data/docs/en';

export async function GET() {
    return NextResponse.json(enDocs);
}
