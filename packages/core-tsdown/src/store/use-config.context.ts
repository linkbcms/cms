// Mimic the hook returned by `create`

import { useContext } from 'react';
import { useStore } from 'zustand';
import type { ConfigState } from '@/store/config';
import { ConfigContext } from '@/store/config.context';

export function useConfigContext<T>(selector: (state: ConfigState) => T): T {
  const store = useContext(ConfigContext);
  if (!store) {
    throw new Error('Missing ConfigContext.Provider in the tree');
  }
  return useStore(store, selector);
}
