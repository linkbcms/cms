// app/my-statsig.tsx

'use client';

import {
  StatsigProvider,
  useClientBootstrapInit,
} from '@statsig/react-bindings';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import type React from 'react';

const sdkKey = process.env.NEXT_PUBLIC_STATSIG_SDK_KEY ?? '';

export default function Statsig({
  children,
  values,
}: {
  children: React.ReactNode;
  values: string;
}) {
  const client = useClientBootstrapInit(sdkKey, { userID: 'a-user' }, values, {
    plugins: [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()],
  });

  if (sdkKey === '') {
    return <>{children}</>;
  }

  return <StatsigProvider client={client}>{children}</StatsigProvider>;
}
