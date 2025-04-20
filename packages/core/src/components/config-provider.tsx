import type { CollectionsMap, Theme } from '@/index';
import type { Observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { useObservable } from '@legendapp/state/react';
import { synced } from '@legendapp/state/sync';
import { createContext, useContext, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';

export type Config = {
  ui?: {
    name?: string;
    logo?: () => React.ReactNode;
    theme?: {
      defaultTheme?: Theme;
      storageKey?: string;
    };
  };
  collections: CollectionsMap;
};

const StateContext = createContext<Observable<Config> | undefined>(undefined);

export const ConfigProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: Config;
}): JSX.Element => {
  const $state = useObservable({
    ...config,
    ui: {
      ...config.ui,
      theme: {
        defaultTheme: synced({
          initial: config.ui?.theme?.defaultTheme || 'system',
          persist: {
            name: config.ui?.theme?.storageKey || 'linkb-cms-ui-theme',
            plugin: ObservablePersistLocalStorage,
          },
        }),
        storageKey: config.ui?.theme?.storageKey,
      },
    },
  });

  useEffect(() => {
    $state.set({
      ...config,
      ui: {
        ...config.ui,
        theme: {
          defaultTheme: config.ui?.theme?.defaultTheme || 'system',
          storageKey: config.ui?.theme?.storageKey,
        },
      },
    });
  }, [config, $state]);

  return (
    <StateContext.Provider value={$state as any}>
      {children}
    </StateContext.Provider>
  );
};

export const useConfig = (): Observable<Config> => {
  const $state = useContext(StateContext);
  if (!$state) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return $state;
};
