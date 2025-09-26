// Provider wrapper

import { useMemo } from 'react';
import {
  type ConfigProps,
  type ConfigStore,
  createConfigStore,
} from '@/store/config';
import { ConfigContext } from '@/store/config.context';

type ConfigProviderProps = React.PropsWithChildren<ConfigProps>;

export function ConfigProvider({ children, config }: ConfigProviderProps) {
  const memoizedStore = useMemo<ConfigStore>(() => {
    return createConfigStore({ config });
  }, [config]);

  return (
    <ConfigContext.Provider value={memoizedStore}>
      {children}
    </ConfigContext.Provider>
  );
}
