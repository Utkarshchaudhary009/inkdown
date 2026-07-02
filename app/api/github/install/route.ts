import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Generate a random state token to prevent CSRF during installation
  const state = crypto.randomBytes(32).toString('hex');

  const githubAppName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME;
  if (!githubAppName) {
    return NextResponse.json({ error: "NEXT_PUBLIC_GITHUB_APP_NAME is not configured" }, { status: 500 });
  }

  const installUrl = `https://github.com/apps/${githubAppName}/installations/new?state=${state}`;

  const response = NextResponse.redirect(installUrl);

  // Set HttpOnly cookie for state validation when GitHub redirects back
  response.cookies.set('github_install_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  return response;
}
