// tsdown.config.ts
import { paraglideRolldownPlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'tsdown';
import react from '@vitejs/plugin-react';

export default defineConfig({
  entry: ['./src'],
  plugins: [
    react(),
    paraglideRolldownPlugin({
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
  dts: true,

  // platform: 'neutral',

  alias: {
    '@/*': './*',
  },

  // ...
});
