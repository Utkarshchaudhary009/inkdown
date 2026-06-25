import { LibraryDashboard } from "@/components/library/LibraryDashboard";

export const metadata = {
  title: "Library | InkDown",
  description: "Browse your GitHub repositories.",
};

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <LibraryDashboard />
    </div>
  );
}
