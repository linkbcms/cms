// app/statsig-backend.ts

import { Statsig, StatsigUser } from '@statsig/statsig-node-core';

export const isStatsigEnabled = process.env.STATSIG_SERVER_KEY !== undefined;

export async function generateBootstrapValues(): Promise<string> {
  const statsig = new Statsig(process.env.STATSIG_SERVER_KEY ?? '');

  // Initialize statsig with options
  const initialize = statsig.initialize();
  const user = new StatsigUser({ userID: 'a-user', customIDs: {} });
  await initialize;
  const values = statsig.getClientInitializeResponse(user, {
    hashAlgorithm: 'djb2',
  }) as string;
  return values;
}
