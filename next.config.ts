import type { NextConfig } from "next";

const withSerwistInit = require("@serwist/next").default;

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: ["/~offline"],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
