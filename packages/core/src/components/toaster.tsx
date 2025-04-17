'use client';

import { useConfig } from '@/components/config-provider';
import { reactive } from '@legendapp/state/react';
import {
  Sonner,
  type ToasterProps,
  toast,
} from '@linkbcms/ui/components/sonner';
import type { JSX } from 'react/jsx-runtime';

const ReactiveSonner = reactive(Sonner);

const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const config$ = useConfig();

  return (
    <ReactiveSonner
      $theme={() =>
        config$.ui.theme.defaultTheme.get() as ToasterProps['theme']
      }
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
