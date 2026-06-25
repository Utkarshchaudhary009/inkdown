'use server';

import { auth } from '@clerk/nextjs/server';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { type Repo } from '@/components/repo-card';

const getInstallationQuery = db
  .select({ githubInstallationId: users.githubInstallationId })
  .from(users)
  .where(eq(users.clerkId, sql.placeholder('userId')));

export async function getOctokit() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const results = await getInstallationQuery.execute({ userId });
  const user = results[0];

  const installationId = user?.githubInstallationId;

  if (!installationId) {
    throw new Error('GITHUB_APP_NOT_INSTALLED');
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials missing in environment variables');
  }

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId: parseInt(installationId, 10),
    },
  });
}

export async function getUserRepos(): Promise<Repo[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });
  return data as unknown as Repo[];
}

export async function getRepoTree(owner: string, repo: string) {
  const octokit = await getOctokit();
  
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: defaultBranch,
    recursive: '1',
  });

  if (data.truncated) {
    console.warn(`[InkDown] Repository tree for ${owner}/${repo} was truncated by GitHub API (exceeded 100,000 limits). Some files may be missing.`);
  }

  return {
    truncated: data.truncated,
    tree: data.tree.filter((file) => file.path && file.path.endsWith('.md'))
  };
}

export async function getFileContent(owner: string, repo: string, path: string) {
  const octokit = await getOctokit();
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!('content' in data)) {
    throw new Error('Not a file');
  }

  return Buffer.from(data.content, 'base64').toString('utf-8');
}
