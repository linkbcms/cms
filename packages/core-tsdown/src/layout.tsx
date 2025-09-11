import type React from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div>Layout</div>

      {children}
    </div>
  );
};
