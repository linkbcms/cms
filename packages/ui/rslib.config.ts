import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],

  lib: [
    {
      bundle: false,
      dts: {
        abortOnError: true,
        build: true,
      },
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },

  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
