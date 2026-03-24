export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getGalTeacherResponse } from '@/lib/ai-service';

// Upstash Redis クライアント（環境変数から自動取得）
const redis = Redis.fromEnv();

// レート制限の設定
const DAILY_USER_LIMIT = 20;   // 1ユーザーあたり20回/日
const DAILY_GLOBAL_LIMIT = 200; // 全体で200回/日

/** 今日の日付キー（例: "2026-03-23"）*/
function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

/** IPアドレスを取得（Cloudflare / Vercel 両対応）*/
function getClientIp(req: Request): string {
    const forwarded = req.headers.get('cf-connecting-ip')    // Cloudflare
        ?? req.headers.get('x-real-ip')                        // 一般的なプロキシ
        ?? req.headers.get('x-forwarded-for')?.split(',')[0]   // Vercel等
        ?? 'unknown';
    return forwarded.trim();
}

export async function POST(req: Request) {
    const redis = Redis.fromEnv(); // リクエスト時に初期化（ビルド時エラー回避）
    const today = getTodayKey();
    const ip = getClientIp(req);

    try {
        // ── グローバル上限チェック ──────────────────────
        const globalKey = `rate:global:${today}`;
        const globalCount = await redis.incr(globalKey);
        if (globalCount === 1) {
            await redis.expire(globalKey, 86400); // 翌日リセット
        }
        if (globalCount > DAILY_GLOBAL_LIMIT) {
            return NextResponse.json(
            { error: '今日はみんな使いすぎてサーバーがお疲れ気味〜😴 明日またね！' },
            { status: 429 }
            );
        }

        // ── 個人上限チェック ────────────────────────────
        const userKey = `rate:user:${ip}:${today}`;
        const userCount = await redis.incr(userKey);
        if (userCount === 1) {
          await redis.expire(userKey, 86400); // 翌日リセット
        }
        if (userCount > DAILY_USER_LIMIT) {
            return NextResponse.json(
                { error: `今日は${DAILY_USER_LIMIT}回も聞いてくれたじゃん！💖 続きは明日ね！` },
                { status: 429 }
            );
        }

        // ── AI呼び出し ──────────────────────────────────
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