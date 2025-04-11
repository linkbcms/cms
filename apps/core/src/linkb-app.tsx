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

// import './App.css';

export const LinkbApp = ({ config }: { config: Config }) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <StrictMode>
      <ClientOnly>
        <ConfigProvider config={config}>
          <BrowserRouter basename="/cms">
            <Routes>
              <Route path=":lang?/" element={<App />} />
              <Route
                path=":lang?/collections/:collection"
                element={<CollectionsScreen />}
              />
              <Route
                path=":lang?/singletons/:singleton"
                element={<SingletonsScreen />}
              />
              <Route
                path=":lang?/custom-collections/:customCollection"
                element={<CustomComponents />}
              />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </ConfigProvider>
      </ClientOnly>
    </StrictMode>
  );
};

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted ? children : null;
};
