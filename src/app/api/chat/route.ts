export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getGalTeacherResponse } from '@/lib/ai-service';

const DAILY_USER_LIMIT = 20;
const DAILY_GLOBAL_LIMIT = 200;

function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

function getClientIp(req: Request): string {
    const forwarded = req.headers.get('cf-connecting-ip')
        ?? req.headers.get('x-real-ip')
        ?? req.headers.get('x-forwarded-for')?.split(',')[0]
        ?? 'unknown';
    return forwarded.trim();
}

function checkBasicAuth(req: Request): boolean {
    const validUser = process.env.BASIC_AUTH_USER;
    const validPass = process.env.BASIC_AUTH_PASS;
    if (!validUser || !validPass) return true;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Basic ')) return false;
    const base64 = authHeader.split(' ')[1];
    const [user, pass] = atob(base64).split(':');
    return user === validUser && pass === validPass;
}

export async function POST(req: Request) {
    if (!checkBasicAuth(req)) {
        return new NextResponse('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="GAL SENSEI"' },
        });
    }

    const redis = Redis.fromEnv();
    const today = getTodayKey();
    const ip = getClientIp(req);

    try {
        const globalKey = `rate:global:${today}`;
        const globalCount = await redis.incr(globalKey);
        if (globalCount === 1) await redis.expire(globalKey, 86400);
        if (globalCount > DAILY_GLOBAL_LIMIT) {
            return NextResponse.json(
                { error: '今日はみんな使いすぎてサーバーがお疲れ気味〜😴 明日またね！' },
                { status: 429 }
            );
        }

        const userKey = `rate:user:${ip}:${today}`;
        const userCount = await redis.incr(userKey);
        if (userCount === 1) await redis.expire(userKey, 86400);
        if (userCount > DAILY_USER_LIMIT) {
            return NextResponse.json(
                { error: `今日は${DAILY_USER_LIMIT}回も聞いてくれたじゃん！💖 続きは明日ね！` },
                { status: 429 }
            );
        }

        const { prompt } = await req.json();
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return NextResponse.json(
                { error: '何を聞きたいか教えてくれないとわかんないよ〜！💦' },
                { status: 400 }
            );
        }

        const data = await getGalTeacherResponse(prompt.trim());
        return NextResponse.json(data);

    } catch (error) {
        console.error('[GAL SENSEI API Error]', error);
        return NextResponse.json(
            { error: 'ギャル先生、今ちょっと取り込み中みたいw' },
            { status: 500 }
        );
    }
}
