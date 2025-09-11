import { Link, Route, Router, Switch } from 'wouter';

import type { Config } from '@linkbcms/core-config';

import { m } from './paraglide/messages.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/layout';
import { getLocale, setLocale } from '@/paraglide/runtime.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

export function CMSPage({ config }: { config: Config }) {
  const baseUrl = config?.baseUrl || '/cms';

  return (
    <QueryClientProvider client={queryClient}>
      <Router ssrPath={baseUrl} base={baseUrl}>
        <div className="flex gap-2">
          {m.example_message_2({ username: 'John Doe' })}
          <Link to="/">Home2</Link>
          <Link to="/collections">Collections2</Link>
          <Link to="/collections/posts">Posts</Link>
          <Link to="/collections/posts/add/new">Add New Post</Link>
          <Link to="/collections/posts/1">Post 1</Link>

          <div className="flex gap-2">
            Current Locale: {getLocale()}
            <button type="button" onClick={() => setLocale('id')}>
              Go to ID
            </button>
            <button type="button" onClick={() => setLocale('en')}>
              Go to EN
            </button>
          </div>
        </div>

        <Layout>
          <Switch>
            <Route path="/">Home</Route>
            <Route path="/collections" nest>
              <div>Collections</div>

              <Link to="/posts">
                <div>Go To Posts Collection</div>
              </Link>

              <Route path="/:collection" nest>
                {/* {(params) => <div>Collection {params.collection}</div>} */}

                <Route path="/add/new">
                  <div>Add New Collection Item</div>
                </Route>

                <Route path="/:item">
                  <div>Collection Item</div>
                </Route>

                <Link to="~collections">
                  <div>Back To Collections</div>
                </Link>
              </Route>

              <Link to="/..">
                <div>Back To Home</div>
              </Link>
            </Route>

            <Route path="*">
              {(params) =>
                `404, Sorry the page /${params['*']} does not exist!`
              }
            </Route>
          </Switch>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

const InboxPage = () => {
  return <div>InboxPage</div>;
};
