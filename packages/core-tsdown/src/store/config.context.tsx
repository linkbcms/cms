import { createContext } from 'react';
import type { ConfigStore } from '@/store/config';

export const ConfigContext = createContext<ConfigStore | null>(null);
