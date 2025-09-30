import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { paraglideRolldownPlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'rollup-plugin-postcss';
import { defineConfig } from 'tsdown';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  entry: ['src/main.tsx', 'src/styles.css'],
  platform: 'browser',
  dts: true,
  minify: false,

  clean: false,
  sourcemap: false,
  format: 'esm',
  treeshake: true,
  outDir: './dist',
  alias: {
    '@': path.resolve(__dirname, './src'),
  },

  external: ['wouter', '@linkbcms/core-config', '@linkbcms/ui'],

  // https://github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts#L10-L13
  banner: {
    js: '"use client"',
  },

  plugins: [
    // @ts-expect-error
    postcss({
      // Or with custom file name, it will generate file relative to bundle.js in v3
      extract: 'styles.css',
      plugins: [tailwindcss],
    }),
    paraglideRolldownPlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
    }),
  ],
});
