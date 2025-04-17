import bundleAnalyzer from '@next/bundle-analyzer';
import packageJson from './package.json' assert { type: 'json' };
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const REPO_SCOPE = '@linkbcms';

const repoModules = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}).filter((packageName) => packageName.startsWith(REPO_SCOPE));

const repoAlias = Object.fromEntries(
  repoModules.map((moduleName) => {
    const shortName = moduleName.replace(`${REPO_SCOPE}/`, ''); // remove scope
    const modulePath = path.resolve(`../../modules/${shortName}/src`); // derive path
    return [moduleName, modulePath];
  }),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@linkbcms/ui', '@linkbcms/core'],
  // webpack: (config, _options) => {
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     ...repoAlias,
  //   }
  //   return config
  // },

  // turbopack: {
  //   resolveAlias: {
  //     '@linkbcms/core': path.resolve(__dirname, '../../modules/core/src'),
  //     '@linkbcms/ui': path.resolve(__dirname, '../../modules/ui/src'),
  //   },
  // },
};

export default nextConfig;
