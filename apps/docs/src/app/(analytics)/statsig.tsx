// app/my-statsig.tsx

'use client';

import type React from 'react';
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';

const sdkKey = process.env.NEXT_PUBLIC_STATSIG_SDK_KEY ?? '';

export default function Statsig({ children }: { children: React.ReactNode }) {
  const { client } = useClientAsyncInit(
    sdkKey,
    { userID: 'a-user' },
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
    },
  );

  if (sdkKey === '') {
    return <>{children}</>;
  }

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  );
}
