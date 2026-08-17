import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const validUser = process.env.BASIC_AUTH_USER;
    const validPass = process.env.BASIC_AUTH_PASS;

    if (!validUser || !validPass) return NextResponse.next();

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Basic ')) {
        const [user, pass] = atob(authHeader.split(' ')[1]).split(':');
        if (user === validUser && pass === validPass) return NextResponse.next();
    }

    return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="GAL SENSEI"' },
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
