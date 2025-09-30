import type { Config } from '@linkbcms/core-config';
import { Route, Router, Switch } from 'wouter';
import { CollectionPage } from '@/app/collection';
import { CustomCollectionPage } from '@/app/custom-collection';
import { ClientOnly } from '@/client-only';
import BaseLayout from '@/layouts/base';
import { ConfigProvider } from '@/store/config.provider';
import { ThemeProvider } from '@/store/theme-provider';

// biome-ignore lint/performance/noBarrelFile: export all the core config for general usages
export * from '@linkbcms/core-config';

export function CMSPage({ config }: { config?: Config }) {
  const baseUrl = config?.baseUrl || '/cms';

  return (
    <ClientOnly>
      <Router base={baseUrl}>
        <ConfigProvider config={config}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <BaseLayout>
              <Switch>
                <Route path="/">
                  <div className="p-5">
                    <h1>Welcome!</h1>
                  </div>
                </Route>
                <Route nest path="/collections">
                  <div className="p-5">
                    <Route nest path="/:collection">
                      <Route path="/">
                        <CollectionPage />
                      </Route>

                      <Route path="/add/new">
                        <div className="bg-amber-950 p-5">
                          Add New Collection Item
                        </div>
                      </Route>
                      <Route path="/:item">
                        {(params) => (
                          <div className="bg-purple-500 p-5 capitalize">
                            Collection Item {params.item}
                          </div>
                        )}
                      </Route>
                    </Route>
                  </div>
                </Route>

                <Route nest path="/singletons">
                  <div className="bg-red-500 p-5">
                    <div>Singletons</div>
                  </div>
                </Route>

                <Route nest path="/custom-collections">
                  <Route path="/:item">
                    <CustomCollectionPage />
                  </Route>
                </Route>

                <Route path="*">
                  {(params) =>
                    `404, Sorry the page /${params['*']} does not exist!`
                  }
                </Route>
              </Switch>
            </BaseLayout>
          </ThemeProvider>
        </ConfigProvider>
      </Router>
    </ClientOnly>
  );
}
