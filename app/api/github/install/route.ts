import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME;
  if (!appName) {
    return NextResponse.redirect(new URL('/library', req.url));
  }

  const state = crypto.randomUUID();

  // Store the state in an HttpOnly cookie that expires in 10 minutes
  const cookieStore = await cookies();
  cookieStore.set('github_setup_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  const installUrl = new URL(`https://github.com/apps/${appName}/installations/new`);
  installUrl.searchParams.set('state', state);

  return NextResponse.redirect(installUrl);
}
