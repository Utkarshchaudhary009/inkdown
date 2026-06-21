import Image from 'next/image';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, CloudOff, GitBranch, Highlighter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: CloudOff,
    title: 'Offline-first library',
    description: 'Keep opened Markdown files available when Wi-Fi disappears.',
  },
  {
    icon: Highlighter,
    title: 'Reader memory',
    description: 'Save progress, bookmarks, and highlights around how people actually read.',
  },
  {
    icon: Sparkles,
    title: 'Calm focus modes',
    description: 'Themes, typography controls, TTS, search, and auto-scroll stay out of the way until needed.',
  },
];

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/library');
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <Image src="/icons/inkdown-icon.svg" alt="InkDown" width={28} height={28} priority />
            Kindle-like reading for GitHub Markdown
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Turn your GitHub notes into a beautiful reading ritual.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              InkDown is built for developers, founders, and knowledge workers who want their READMEs,
              docs, specs, and private Markdown libraries to feel fast, focused, and always available.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SignInButton mode="modal">
              <Button size="lg" className="gap-2">
                <GitBranch className="size-5" />
                Sign in with GitHub
                <ArrowRight className="size-4" />
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </SignUpButton>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <feature.icon className="mb-3 size-5 text-primary" />
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-primary/20 blur-3xl" />
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Image src="/icons/inkdown-icon.svg" alt="" width={42} height={42} aria-hidden />
                <div>
                  <p className="font-semibold">InkDown Reader</p>
                  <p className="text-sm text-muted-foreground">private-repo/specs/strategy.md</p>
                </div>
              </div>
              <BookOpen className="size-5 text-primary" />
            </div>
            <article className="space-y-5 rounded-3xl bg-background px-6 py-8">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Deep read mode</p>
              <h2 className="text-3xl font-semibold tracking-tight">A quieter way to read technical knowledge.</h2>
              <p className="leading-8 text-muted-foreground">
                Resume at your last heading, keep highlights safe offline, and let controls fade away so the
                document becomes the product.
              </p>
              <div className="space-y-3 pt-4">
                <div className="h-3 w-full rounded-full bg-muted" />
                <div className="h-3 w-10/12 rounded-full bg-muted" />
                <div className="h-3 w-8/12 rounded-full bg-primary/40" />
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
