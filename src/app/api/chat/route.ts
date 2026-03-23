// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getGalTeacherResponse } from '@/lib/ai-service';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        const data = await getGalTeacherResponse(prompt);
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'ギャル先生、今ちょっと取り込み中みたいw' }, { status: 500 });
    }
}