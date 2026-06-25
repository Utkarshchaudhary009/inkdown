import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const url = new URL(req.url);
  const installationId = url.searchParams.get('installation_id');

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

  return NextResponse.redirect(new URL('/library', req.url));
}
