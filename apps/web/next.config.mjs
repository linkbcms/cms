import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@linkbcms/*'],
  webpack: (config) => {
    // config.optimization.minimize = false;
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
