// app/my-statsig.tsx

'use client';

import type React from 'react';
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';

export default function Statsig({ children }: { children: React.ReactNode }) {
  const { client } = useClientAsyncInit(
    'client-Ecn4kdJzFgxpeYkSPHjYGKHRAhIrDNWZ3Gl338nRU2V',
    { userID: 'a-user' },
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
    },
  );

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  );
}
