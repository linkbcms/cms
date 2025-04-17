'use client';

import type React from 'react';

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === 'undefined') {
    return null;
  }
  return children;
};

// Component that throws when rendered
export function BrokenImage() {
  // This will throw when rendered
  const imageSrc = null;
  // @ts-ignore - intentionally using undefined variable
  return <img src={imageSrc.toString()} alt="broken" />;
}

// Component that uses browser APIs unsafely
export function BrokenBrowserAPI() {
  // This will throw in server environment
  const width = document.body.clientWidth;
  return <div style={{ width }}>Browser API component</div>;
}

// Component that throws during initialization
export function BrokenInitialization() {
  // This throws immediately during initialization
  throw new Error('Component failed during initialization');
  return <div>This will never render</div>;
}

// Component that uses undefined variables
export function BrokenUndefined() {
  // @ts-ignore - intentionally using undefined variable
  return <div>{nonExistentVariable}</div>;
}
