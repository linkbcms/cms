import path from 'node:path';
import { paraglideRolldownPlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*'],

  // clean: true,
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
    // postcss({
    //   extract: true,
    //   plugins: [tailwindcss],
    // }),
    paraglideRolldownPlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'cookie'],
      urlPatterns: [
        {
          pattern: '/:path(.*)?',
          localized: [
            ['de', '/de/:path(.*)?'],
            // ✅ make sure to match the least specific path last
            ['en', '/:path(.*)?'],
          ],
        },
      ],
    }) as any,
  ],
});
