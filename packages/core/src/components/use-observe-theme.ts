import { useObserve } from '@legendapp/state/react';
import { useConfig } from '@/components/config-provider';

export function useObserveTheme() {
  const config$ = useConfig();

  useObserve(() => {
    const theme = config$.ui.theme.defaultTheme.get();
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    theme && root.classList.add(theme);
  });
}
