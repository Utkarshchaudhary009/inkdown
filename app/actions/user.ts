'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function getUserInstallationStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { isInstalled: false };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: {
      githubInstallationId: true,
    }
  });

  return { 
    isInstalled: !!user?.githubInstallationId,
    installationId: user?.githubInstallationId 
  };
}
