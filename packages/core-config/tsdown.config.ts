import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/*.ts'],
  platform: 'neutral',
  dts: true,
});
