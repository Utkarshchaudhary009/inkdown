import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InkDown',
    short_name: 'InkDown',
    description: 'A Kindle-like GitHub Markdown reader for focused, offline-first reading.',
    start_url: '/library',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fefefe',
    theme_color: '#7c3aed',
    categories: ['productivity', 'books', 'utilities'],
    icons: [
      {
        src: '/icons/inkdown-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/inkdown-maskable.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
