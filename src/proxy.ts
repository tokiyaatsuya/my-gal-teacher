import { NextRequest, NextResponse } from 'next/server';

const VALID_USER = process.env.BASIC_AUTH_USER!;
const VALID_PASS = process.env.BASIC_AUTH_PASS!;

export function proxy(req: NextRequest) {
    // 認証情報が未設定の場合はスルー（開発環境用）
    if (!VALID_USER || !VALID_PASS) {
        return NextResponse.next();
    }

    const authHeader = req.headers.get('authorization');

    if (authHeader?.startsWith('Basic ')) {
        const base64 = authHeader.split(' ')[1];
        const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

        if (user === VALID_USER && pass === VALID_PASS) {
            return NextResponse.next();
        }
    }

    // 認証失敗 → ブラウザにID/パス入力を求める
    // ※ WWW-Authenticate ヘッダーはASCII文字のみ使用可能
    return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="GAL SENSEI"',
        },
    });
}

export const config = {
    // _next内部・favicon・publicフォルダの画像は認証不要
    matcher: ['/((?!_next/static|_next/image|favicon.ico|characters/).*)'],
};