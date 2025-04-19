import { defineConfig } from '@rslib/core';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'node',
    minify: isProduction,
  },

  source: {
    entry: {
      index: 'src/**',
    },

    define: {
      RSLIB_VERSION: JSON.stringify(require('./package.json').version),
    },
  },
});
