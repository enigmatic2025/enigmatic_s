import { NextResponse } from 'next/server';
import { enDocs } from '@/data/docs/en';
import { viDocs } from '@/data/docs/vi';
import { zhTwDocs } from '@/data/docs/zh-TW';

export async function generateStaticParams() {
    return [
        { lang: 'en' },
        { lang: 'vi' },
        { lang: 'zh-TW' },
    ];
}

export async function GET(
    request: Request,
    { params }: { params: { lang: string } }
) {
    const lang = params.lang;

    let docs;
    switch (lang) {
        case 'vi':
            docs = viDocs;
            break;
        case 'zh-TW':
            docs = zhTwDocs;
            break;
        case 'en':
        default:
            docs = enDocs;
            break;
    }

    return NextResponse.json(docs);
}
