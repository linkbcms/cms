import { Routes } from 'react-router';
import { BrowserRouter } from 'react-router';
import { Route } from 'react-router';
import { StrictMode, useEffect, useState } from 'react';
import { App } from './App';

export const LinkbApp = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    <StrictMode>
      <ClientOnly>
        <BrowserRouter basename="/cms">
          <Routes>
            <Route path=":lang?/" element={<App />} />
          </Routes>
        </BrowserRouter>
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
