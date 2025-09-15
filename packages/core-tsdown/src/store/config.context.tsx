import type { ConfigStore } from '@/store/config';
import { createContext } from 'react';

export const ConfigContext = createContext<ConfigStore | null>(null);
