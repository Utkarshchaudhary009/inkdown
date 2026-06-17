import { getRepoTree } from "@/lib/github";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const files = await getRepoTree(owner, repo);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/library" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Library
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {owner}/{repo}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.length === 0 ? (
          <p className="text-muted-foreground">No markdown files found in this repository.</p>
        ) : (
          files.map((file) => (
            <Link key={file.path} href={`/read/${owner}/${repo}/${file.path}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base break-all">{file.path}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
