import { auth, clerkClient } from '@clerk/nextjs/server';
import { Octokit } from '@octokit/rest';

export async function getOctokit() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const client = await clerkClient();
  const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'oauth_github');
  
  const token = tokenResponse.data[0]?.token;
  if (!token) {
    throw new Error('GitHub OAuth token not found');
  }

  return new Octokit({ auth: token });
}

export async function getUserRepos() {
  const octokit = await getOctokit();
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });
  return data;
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

  return data.tree.filter((file) => file.path && file.path.endsWith('.md'));
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
