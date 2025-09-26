import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/beta.ts'],
  platform: 'neutral',
  dts: true,
});
