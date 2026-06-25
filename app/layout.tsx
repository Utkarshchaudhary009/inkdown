import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SerwistProvider } from "@serwist/next/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalSync } from "@/components/GlobalSync";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  title: {
    default: "InkDown",
    template: "%s | InkDown",
  },
  description: "A Kindle-like GitHub Markdown reader for focused, offline-first reading.",
  applicationName: "InkDown",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/inkdown-icon.svg",
    apple: "/icons/icon-512x512.png",
  },
  openGraph: {
    type: "website",
    siteName: "InkDown",
    title: "InkDown",
    description: "A Kindle-like GitHub Markdown reader for focused, offline-first reading.",
    images: ["/icons/icon-512x512.png"],
  },
  twitter: {
    card: "summary",
    title: "InkDown",
    description: "A Kindle-like GitHub Markdown reader for focused, offline-first reading.",
    images: ["/icons/icon-512x512.png"],
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "InkDown",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

// Inline script to prevent Flash of Unstyled Content (FOUC)
// This reads settings from localStorage and applies dataset, class, and variables BEFORE body renders.
const FoucPreventionScript = () => {
  const code = `
    (function() {
      try {
        const theme = localStorage.getItem('inkdown-theme') || 'system';
        let resolvedTheme = theme;
        if (theme === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.dataset.theme = resolvedTheme;
        
        const isDarkAligned = ['dark', 'night', 'forest'].includes(resolvedTheme);
        if (isDarkAligned) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        const fontFamily = localStorage.getItem('inkdown-fontFamily') || 'sans';
        const fontFamilyValue = fontFamily === 'serif' ? 'ui-serif, Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif';
        document.documentElement.style.setProperty('--font-family', fontFamilyValue);
        
        const fontSize = localStorage.getItem('inkdown-fontSize') || '1';
        document.documentElement.style.setProperty('--font-size-multiplier', fontSize);
      } catch {
        // If accessing localStorage or setting CSS variables fails, avoid
        // overriding an existing theme and instead prefer the system setting.
        if (!document.documentElement.dataset.theme) {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
        }
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <FoucPreventionScript />
      </head>
      <body>
        <ClerkProvider>
          <SerwistProvider swUrl="/sw.js">
            <ThemeProvider>
              {children}
              <GlobalSync />
              <Toaster position="bottom-right" />
            </ThemeProvider>
          </SerwistProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
