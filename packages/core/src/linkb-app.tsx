import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { JSX } from 'react/jsx-runtime';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ConfigProvider } from '@/components/config-provider';
import { Toaster } from '@/components/toaster';
import type { Config } from '@/index';
import Layout from '@/layout';
import { CollectionScreen } from '@/pages/collection';
import { CollectionsScreen } from '@/pages/collections';
import { CustomComponents } from '@/pages/custom-components';
import { SingletonsScreen } from '@/pages/singletons';
import { App } from './App';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

export const LinkbApp = ({ config }: { config: Config }): JSX.Element => {
  if (typeof window === 'undefined') {
    return <></>;
  }

  return (
    <ClientOnly>
      <ConfigProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename="/cms">
            <Routes>
              <Route element={<Layout />} path=":lang?/">
                <Route element={<App />} index />
                <Route
                  element={<CollectionsScreen />}
                  path="collections/:collection"
                />
                <Route
                  element={<CollectionScreen />}
                  path="collections/:collection/add/new"
                />
                <Route
                  element={<CollectionScreen />}
                  path="collections/:collection/:item"
                />
                <Route
                  element={<SingletonsScreen />}
                  path="singletons/:singleton"
                />
                <Route
                  element={<CustomComponents />}
                  path="custom-collections/:customCollection"
                />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </QueryClientProvider>
      </ConfigProvider>
    </ClientOnly>
  );
};

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted ? children : null;
};
