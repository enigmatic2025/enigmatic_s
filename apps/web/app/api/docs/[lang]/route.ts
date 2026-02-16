import { NextResponse } from 'next/server';
import { enDocs } from '@/data/docs/en';
import { viDocs } from '@/data/docs/vi';
import { zhTwDocs } from '@/data/docs/zh-TW';
import { esDocs } from '@/data/docs/es';

export async function generateStaticParams() {
    return [
        { lang: 'en' },
        { lang: 'vi' },
        { lang: 'zh-TW' },
        { lang: 'es' },
    ];
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ lang: string }> }
) {
    const { lang } = await params;

    let docs;
    switch (lang) {
        case 'vi':
            docs = viDocs;
            break;
        case 'zh-TW':
            docs = zhTwDocs;
            break;
        case 'es':
            docs = esDocs;
            break;
        case 'en':
        default:
            docs = enDocs;
            break;
    }

    return NextResponse.json(docs);
}
