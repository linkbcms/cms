import type { Config } from '@linkbcms/core-config';
import { createStore } from 'zustand';

export type ConfigProps = {
  config?: Config;
};

export interface ConfigState extends ConfigProps {}

export type ConfigStore = ReturnType<typeof createConfigStore>;

export const createConfigStore = (initProps?: Partial<ConfigProps>) => {
  const DEFAULT_PROPS: ConfigProps = {
    config: {},
  };
  return createStore<ConfigState>()((_set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }));
};
