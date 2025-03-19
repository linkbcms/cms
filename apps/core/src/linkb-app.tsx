import { type Config, ConfigProvider } from '@/components/config-provider';
import { StrictMode, useEffect, useState } from 'react';
import { Routes } from 'react-router';
import { BrowserRouter } from 'react-router';
import { Route } from 'react-router';
import { App } from './App';

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
            </Routes>
          </BrowserRouter>
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
