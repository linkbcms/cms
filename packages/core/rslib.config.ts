import { paraglideRspackPlugin } from '@inlang/paraglide-js';
import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginDts } from 'rsbuild-plugin-dts';

export default defineConfig({
  plugins: [pluginReact(), pluginDts()],

  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },

  tools: {
    rspack: {
      plugins: [
        paraglideRspackPlugin({
          project: './project.inlang',
          outdir: './src/paraglide',
          strategy: ['url'],
          urlPatterns: [
            {
              pattern:
                ':protocol://:domain(.*)::port?/cms/:locale(de|en)?/:path(.*)?',
              // the original URL is https://example.com/about.
              // hence, the locale is null
              deLocalizedNamedGroups: { locale: null },
              localizedNamedGroups: {
                // the en locale should have no locale in the URL
                // hence, the locale is null
                en: { locale: null },
                // the de locale should have the locale in the URL
                de: { locale: 'de' },
              },
            },
          ],
        }),
      ],
    },
  },

  source: {
    entry: {
      index: ['./src/**'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'process.env.SUPABASE_KEY': JSON.stringify(process.env.SUPABASE_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(
        process.env.GOOGLE_CLIENT_ID,
      ),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(
        process.env.GOOGLE_CLIENT_SECRET,
      ),
      'process.env.GITHUB_CLIENT_ID': JSON.stringify(
        process.env.GITHUB_CLIENT_ID,
      ),
      'process.env.GITHUB_CLIENT_SECRET': JSON.stringify(
        process.env.GITHUB_CLIENT_SECRET,
      ),
    },
  },
});
