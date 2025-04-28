import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages: ['@linkbcms/core'],
  serverExternalPackages: ['pg', 'drizzle-orm'],
};

export default nextConfig;
