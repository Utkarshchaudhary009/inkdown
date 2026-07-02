import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const url = new URL(req.url);
  const installationId = url.searchParams.get('installation_id');
  const state = url.searchParams.get('state');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('github_install_state')?.value;

  // Validate state to prevent CSRF / IDOR attacks linking an attacker's installation to a victim's account
  if (!state || !savedState || state !== savedState) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 403 });
  }

  if (installationId) {
    try {
      await db.update(users)
        .set({ githubInstallationId: installationId })
        .where(eq(users.clerkId, userId));
    } catch (error) {
      console.error('Failed to save githubInstallationId:', error);
      // Even if it fails, maybe we should log and proceed, but ideally it works.
    }
  }

  const response = NextResponse.redirect(new URL('/library', req.url));

  // Clear the state cookie after successful use
  response.cookies.delete('github_install_state');

  return response;
}
