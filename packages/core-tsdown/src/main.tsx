import type { Config, CustomCollectionConfig } from '@linkbcms/core-config';
import { Link, Route, Router, Switch } from 'wouter';
import { ClientOnly } from '@/client-only';
import BaseLayout from '@/layouts/base';
import { m } from '@/paraglide/messages';
import { ConfigProvider } from '@/store/config.provider';
import { ThemeProvider } from '@/store/theme-provider';

// biome-ignore lint/performance/noBarrelFile: <explanation>
export * from '@linkbcms/core-config';

export function CMSPage({ config }: { config?: Config }) {
  const baseUrl = config?.baseUrl || '/cms';

  const customCollections = Object.entries(config?.collections || {}).filter(
    ([, value]) => {
      const v = value;
      if (!v) {
        return false;
      }
      return 'type' in v && v.type === 'customCollection';
    },
  ) as [string, CustomCollectionConfig][];

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
                    <h1>{m.helpful_minor_mink_tap()}</h1>
                    <div>{m.helpful_minor_mink_tap()}</div>

                    <Link className={'underline'} to={'/posts'}>
                      <div>
                        {m.basic_chunky_alpaca_learn({
                          collectionName: 'Posts',
                        })}
                      </div>
                    </Link>
                    <Link className={'underline'} to={'/blogs'}>
                      <div>
                        {m.basic_chunky_alpaca_learn({
                          collectionName: 'Blogs',
                        })}
                      </div>
                    </Link>

                    <Route nest path="/:collection">
                      {(collectionParams) => (
                        <div className="bg-yellow-500 p-5 capitalize">
                          {m.giant_fine_capybara_flip({
                            collection: collectionParams.collection,
                          })}
                          <div className="flex flex-wrap gap-2 p-5">
                            <Link className={'underline'} to={'/add/new'}>
                              {m.such_crisp_lizard_succeed()}
                            </Link>
                            <Link className={'underline'} to={'/1'}>
                              Collection Item 1
                            </Link>
                            <Link className={'underline'} to={'/2'}>
                              Collection Item 2
                            </Link>
                          </div>
                          <Route path="/add/new">
                            <div className="bg-amber-950 p-5">
                              Add New Collection Item
                              <Link
                                className={'underline'}
                                to={`~${baseUrl}/collections/${collectionParams.collection}`}
                              >
                                <div>
                                  Back To Collection{' '}
                                  {collectionParams.collection}
                                </div>
                              </Link>
                            </div>
                          </Route>
                          <Route path="/:item">
                            {(params) => (
                              <div className="bg-purple-500 p-5 capitalize">
                                Collection Item {params.item}
                                <Link
                                  className={'underline'}
                                  to={`~${baseUrl}/collections/${collectionParams.collection}`}
                                >
                                  <div>
                                    Back To Collection{' '}
                                    {collectionParams.collection}
                                  </div>
                                </Link>
                              </div>
                            )}
                          </Route>
                          <Link
                            className={'underline'}
                            to={`~${baseUrl}/collections`}
                          >
                            <div>Back To Collections</div>
                          </Link>
                        </div>
                      )}
                    </Route>

                    <Link className={'underline'} to={`~${baseUrl}`}>
                      <div>Back To Home</div>
                    </Link>
                  </div>
                </Route>

                <Route nest path="/singletons">
                  <div className="bg-red-500 p-5">
                    <div>Singletons</div>
                  </div>
                </Route>

                <Route nest path="/custom-collections">
                  <div className="bg-red-500 p-5">
                    <div>Custom Collections</div>
                  </div>

                  {customCollections.map(([collection, value]) => (
                    <div key={collection}>
                      <div>{value.label}</div>

                      <value.Component />
                    </div>
                  ))}
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
