import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Statsig from '@/app/(analytics)/statsig';
import { generateBootstrapValues } from '@/app/(analytics)/statsig.server';

const inter = Inter({
  subsets: ['latin'],
});

const isStatsigEnabled = process.env.STATSIG_SERVER_KEY !== undefined;

export default async function Layout({ children }: { children: ReactNode }) {
  const values = isStatsigEnabled ? await generateBootstrapValues() : null;
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {isStatsigEnabled && values && (
          <Statsig values={values}>
            <RootProvider>{children}</RootProvider>
          </Statsig>
        )}
        {!isStatsigEnabled && <RootProvider>{children}</RootProvider>}
      </body>
    </html>
  );
}
