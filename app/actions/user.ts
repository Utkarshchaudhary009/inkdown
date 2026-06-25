'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';

const getInstallationQuery = db
  .select({ githubInstallationId: users.githubInstallationId })
  .from(users)
  .where(eq(users.clerkId, sql.placeholder('userId')))
  .prepare('get_installation_query');

export async function getUserInstallationStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { isInstalled: false };
  }

  const result = await getInstallationQuery.execute({ userId });
  const user = result[0];

  return { 
    isInstalled: !!user?.githubInstallationId,
    installationId: user?.githubInstallationId 
  };
}
