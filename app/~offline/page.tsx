import { FileWarning } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
      <FileWarning className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold mb-2">You are offline</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        It looks like you've lost your internet connection. You can still read the files you've saved for offline access.
      </p>
      <Link href="/library" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
        Go to Library
      </Link>
    </div>
  );
}