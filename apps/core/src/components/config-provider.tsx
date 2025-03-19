import type { Observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { useObservable } from '@legendapp/state/react';
import { synced } from '@legendapp/state/sync';
import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export type Config = {
  ui?: {
    name?: string;
    logo?: () => React.ReactNode;
    theme?: {
      defaultTheme?: Theme;
      storageKey?: string;
    };
  };
};

const StateContext = createContext<Observable<Config> | undefined>(undefined);

export const ConfigProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: Config;
}) => {
  const $state = useObservable<Config>({
    ...config,
    ui: {
      ...config.ui,
      theme: {
        defaultTheme: synced({
          initial: config.ui?.theme?.defaultTheme,
          persist: {
            name: config.ui?.theme?.storageKey,
            plugin: ObservablePersistLocalStorage,
          },
        }),
        storageKey: config.ui?.theme?.storageKey,
      },
    },
  });
  return (
    <StateContext.Provider value={$state}>{children}</StateContext.Provider>
  );
};

export const useConfig = () => {
  const $state = useContext(StateContext);
  if (!$state) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return $state;
};
