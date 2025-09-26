import { useMemo } from 'react';
import { useConfigContext } from '@/store/use-config.context';

export const useCollections = () => {
  const config = useConfigContext((s) => s.config);

  const collectionsData = useMemo(() => {
    const fullCollections = Object.entries(config?.collections || {});

    const collections = fullCollections.filter(([, value]) => {
      const v = value;

      if (!v) {
        return false;
      }

      if ('fieldSlug' in v) {
        return true;
      }

      return false;
    });

    const singletons = fullCollections.filter(([, value]) => {
      const v = value;

      if (!v) {
        return false;
      }

      if ('fieldSlug' in v || 'Component' in v) {
        return false;
      }

      return true;
    });

    const customCollections = fullCollections.filter(([, value]) => {
      const v = value;

      if (!v) {
        return false;
      }

      if ('Component' in v) {
        return true;
      }
      return false;
    });
    return { fullCollections, collections, singletons, customCollections };
  }, [config]);

  return { ...collectionsData, config };
};
