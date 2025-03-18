import { m } from './paraglide/messages';
import { getLocale, locales, setLocale } from './paraglide/runtime.js';

import Layout from '@/layout.js';

import '@linkbcms/ui/globals.css';

export const App = () => {
  return (
    <Layout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          <div className="content">
            <h1>Rsbuild with React</h1>
            <p>Start building amazing things with Rsbuild.</p>
            <p>{m.example_message({ username: 'John' })}</p>
            <p>{m.example_message_2({ username: 'John' })}</p>
            <p>{getLocale()}</p>
            {locales.map((locale) => (
              <button key={locale} onClick={() => setLocale(locale)}>
                {locale}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
