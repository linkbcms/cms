import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

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
