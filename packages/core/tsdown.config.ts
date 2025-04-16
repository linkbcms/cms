import { paraglideRolldownPlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'tsdown';
import path from 'node:path';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig({
  entry: ['src/**/*'],

  clean: true,
  dts: {
    ignoreErrors: true,
    include: ['src/**/*'],
  },

  sourcemap: true,

  format: 'esm',
  treeshake: true,
  outDir: './dist',

  alias: {
    '@': path.resolve(__dirname, './src'),
  },

  plugins: [
    postcss({
      extract: true,
      plugins: [tailwindcss],
    }),
    paraglideRolldownPlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url'],
      urlPatterns: [
        {
          pattern:
            ':protocol://:domain(.*)::port?/cms/:locale(de|en)?/:path(.*)?',
          deLocalizedNamedGroups: { locale: null },
          localizedNamedGroups: {
            en: { locale: null },
            de: { locale: 'de' },
          },
        },
      ],
    }),
  ],
});
