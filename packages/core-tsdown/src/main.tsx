import type { Config } from '@linkbcms/core-config';
import { Link, Route, Router, Switch } from 'wouter';
import { ClientOnly } from '@/client-only';
import { Layout } from '@/layout';
import { m } from '@/paraglide/messages';
import { ConfigProvider } from '@/store/config.provider';

export function CMSPage({ config }: { config?: Config }) {
  const baseUrl = config?.baseUrl || '/cms';

  return (
    <ClientOnly>
      <Router base={baseUrl}>
        <ConfigProvider config={config}>
          <Layout>
            <Switch>
              <Route path="/">
                <div className="bg-blue-500 p-5">Home</div>
              </Route>
              <Route nest path="/collections">
                <div className="bg-green-500 p-5">
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
                                Back To Collection {collectionParams.collection}
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

              <Route path="*">
                {(params) =>
                  `404, Sorry the page /${params['*']} does not exist!`
                }
              </Route>
            </Switch>
          </Layout>
        </ConfigProvider>
      </Router>
    </ClientOnly>
  );
}
