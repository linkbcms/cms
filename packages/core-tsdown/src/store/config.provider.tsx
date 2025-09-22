// Provider wrapper

import { useRef } from 'react';
import {
  type ConfigProps,
  type ConfigStore,
  createConfigStore,
} from '@/store/config';
import { ConfigContext } from '@/store/config.context';

type ConfigProviderProps = React.PropsWithChildren<ConfigProps>;

export function ConfigProvider({ children, ...props }: ConfigProviderProps) {
  const storeRef = useRef<ConfigStore>(null);
  if (!storeRef.current) {
    storeRef.current = createConfigStore(props);
  }
  return (
    <ConfigContext.Provider value={storeRef.current}>
      {children}
    </ConfigContext.Provider>
  );
}
