import { getUserRepos } from "@/lib/github";
import { type Repo } from "@/components/repo-card";
import { LibraryDashboard } from "@/components/library/LibraryDashboard";

export const metadata = {
  title: "Library | InkDown",
  description: "Browse your GitHub repositories.",
};

export default async function LibraryPage() {
  const repos = await getUserRepos() as unknown as Repo[];

  return (
    <div className="min-h-screen bg-background">
      <LibraryDashboard initialRepos={repos} />
    </div>
  );
}
