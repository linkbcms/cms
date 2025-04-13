'use client';

import { type Config, ConfigProvider } from '@/components/config-provider';
import { Toaster } from '@/components/toaster';
import Layout from '@/layout';
import { CollectionScreen } from '@/pages/collection';
import { CollectionsScreen } from '@/pages/collections';
import { CustomComponents } from '@/pages/custom-components';
import { SingletonsScreen } from '@/pages/singletons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { App } from './App';

// Create a client
const queryClient = new QueryClient();

export const LinkbApp = ({ config }: { config: Config }) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <ClientOnly>
      <ConfigProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename="/cms">
            <Routes>
              <Route path=":lang?/" element={<Layout />}>
                <Route index element={<App />} />
                <Route
                  path="collections/:collection"
                  element={<CollectionsScreen />}
                />
                <Route
                  path="collections/:collection/add/new"
                  element={<CollectionScreen />}
                />
                <Route
                  path="collections/:collection/:item"
                  element={<CollectionScreen />}
                />
                <Route
                  path="singletons/:singleton"
                  element={<SingletonsScreen />}
                />
                <Route
                  path="custom-collections/:customCollection"
                  element={<CustomComponents />}
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
