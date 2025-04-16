import { paraglideRolldownPlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'tsdown';
import path from 'node:path';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from '@tailwindcss/postcss';
// import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    // css: './src/App.css',
  },
  // entry: ['./src', './src/App.css'],
  // exclude: ['./src/paraglide/**'],

  // fromVite: true,

  // sourcemap: true,
  clean: true,
  dts: {
    ignoreErrors: true,
    // include: ['./src/**'],
    exclude: ['./src/App.css'],

    sourceMap: true,
  },

  outputOptions: {
    // cssEntryFileNames: 'App.css',
    // moduleTypes: { '.css': 'css' },
  },
  inputOptions: {
    // moduleTypes: { '.css': 'css' },
  },

  sourcemap: true,

  format: 'esm',
  treeshake: true,
  outDir: './dist',

  // bundleDts: true,

  alias: {
    '@': path.resolve(__dirname, './src'),
  },

  plugins: [
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

    postcss({
      extract: true,
      plugins: [tailwindcss()],
    }),
    // tailwindcss(),
  ],

  // tsconfigPath: 'tsconfig.json',
});
