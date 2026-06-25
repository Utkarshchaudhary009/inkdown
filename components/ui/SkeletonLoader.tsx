export function RepoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="h-6 w-3/4 bg-muted rounded"></div>
        <div className="h-10 w-10 bg-muted rounded-full shrink-0"></div>
      </div>
      <div className="h-4 w-full bg-muted rounded mt-2"></div>
      <div className="h-4 w-2/3 bg-muted rounded"></div>
      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-8 animate-pulse">
      <div className="h-12 w-3/4 bg-muted rounded mb-8"></div>
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
      </div>
      <div className="space-y-4 mt-8">
        <div className="h-8 w-1/2 bg-muted rounded mb-4"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-4/5 bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
      </div>
    </div>
  );
}
