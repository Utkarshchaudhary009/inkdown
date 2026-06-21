import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          Offline mode
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">You&apos;re offline</h1>
          <p className="text-muted-foreground">
            InkDown keeps opened documents in your local reading cache. Reconnect to browse GitHub again,
            or return to your library to continue with anything already cached on this device.
          </p>
        </div>
        <Button asChild>
          <Link href="/library">Back to library</Link>
        </Button>
      </section>
    </main>
  );
}
