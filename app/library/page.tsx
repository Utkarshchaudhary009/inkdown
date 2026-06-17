import { getUserRepos } from "@/lib/github";
import { RepoCard, type Repo } from "@/components/repo-card";

export const metadata = {
  title: "Library | InkDown",
  description: "Browse your GitHub repositories.",
};

export default async function LibraryPage() {
  const repos = await getUserRepos() as unknown as Repo[];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
}
