import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [pluginReact()],

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
