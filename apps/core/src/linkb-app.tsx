import { ThemeProvider } from '@/components/theme-provider';
import { StrictMode, useEffect, useState } from 'react';
import { Routes } from 'react-router';
import { BrowserRouter } from 'react-router';
import { Route } from 'react-router';
import { App } from './App';

export const LinkbApp = ({ config }: { config: any }) => {
  useEffect(() => {
    console.log(config);
  }, [config]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <StrictMode>
      <ClientOnly>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter basename="/cms">
            <Routes>
              <Route path=":lang?/" element={<App />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
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
