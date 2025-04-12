'use client';

import { type Config, ConfigProvider } from '@/components/config-provider';
import { StrictMode, useEffect, useState } from 'react';
import { Routes } from 'react-router';
import { BrowserRouter } from 'react-router';
import { Route } from 'react-router';
import { App } from './App';
import { CustomComponents } from '@/pages/custom-components';
import { SingletonsScreen } from '@/pages/singletons';
import { Toaster } from '@/components/toaster';
import { CollectionsScreen } from '@/pages/collections';
import { CollectionScreen } from '@/pages/collection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/layout';

// import './App.css';

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
