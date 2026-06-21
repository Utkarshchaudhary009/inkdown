import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local-development';

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [
    { url: '/~offline', revision },
    { url: '/icons/inkdown-icon.svg', revision },
    { url: '/icons/inkdown-maskable.svg', revision },
  ],
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
