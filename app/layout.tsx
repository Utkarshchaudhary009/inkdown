import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InkDown",
  description: "A Kindle-Like GitHub Markdown Reader",
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
      } catch (e) {
        console.error('FOUC script error:', e);
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

