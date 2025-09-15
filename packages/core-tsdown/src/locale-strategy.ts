import {
  defineCustomClientStrategy,
  defineCustomServerStrategy,
} from '@/paraglide/runtime';

export const customQueryParamsStrategy = () => {
  const window = globalThis.window;
  defineCustomClientStrategy('custom-queryParam', {
    getLocale: () => {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('locale') ?? undefined;
    },
    setLocale: (locale) => {
      if (typeof window === 'undefined') {
        return;
      }

      const url = new URL(window.location);
      url.searchParams.set('locale', locale);
      window.history.replaceState({}, '', url.toString());
    },
  });

  defineCustomServerStrategy('custom-queryParam', {
    getLocale: (request) => {
      console.log('request', request);
      if (typeof request === 'undefined') {
        return undefined;
      }

      const url = new URL(request.url);
      return url.searchParams.get('locale') ?? undefined;
    },
  });
};
