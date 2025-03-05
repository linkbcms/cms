import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { paraglideRspackPlugin } from '@inlang/paraglide-js';

export default defineConfig({
  plugins: [pluginReact()],
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
});
