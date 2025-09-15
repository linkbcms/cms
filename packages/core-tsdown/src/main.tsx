import { Link, Route, Router, Switch } from 'wouter';

import type { Config } from '@linkbcms/core-config';

import { Layout } from '@/layout';

import { ClientOnly } from '@/client-only';
import { ConfigProvider } from '@/store/config.provider';

export function CMSPage({
  config,
}: {
  config?: Config;
}) {
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
              <Route path="/collections" nest>
                <div className="bg-green-500 p-5">
                  <div>Collections</div>

                  <Link to={'/posts'} className={'underline'}>
                    <div>Go To Posts Collection</div>
                  </Link>
                  <Link to={'/blogs'} className={'underline'}>
                    <div>Go To Blogs Collection</div>
                  </Link>

                  <Route path="/:collection" nest>
                    {(collectionParams) => (
                      <div className="bg-yellow-500 p-5 capitalize">
                        Collection Page {collectionParams.collection}
                        <div className="flex flex-wrap gap-2 p-5">
                          <Link to={'/add/new'} className={'underline'}>
                            Add New Collection Item
                          </Link>
                          <Link to={'/1'} className={'underline'}>
                            Collection Item 1
                          </Link>
                          <Link to={'/2'} className={'underline'}>
                            Collection Item 2
                          </Link>
                        </div>
                        <Route path="/add/new">
                          <div className="bg-amber-950 p-5">
                            Add New Collection Item
                            <Link
                              to={`~${baseUrl}/collections/${collectionParams.collection}`}
                              className={'underline'}
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
                                to={`~${baseUrl}/collections/${collectionParams.collection}`}
                                className={'underline'}
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
                          to={`~${baseUrl}/collections`}
                          className={'underline'}
                        >
                          <div>Back To Collections</div>
                        </Link>
                      </div>
                    )}
                  </Route>

                  <Link to={`~${baseUrl}`} className={'underline'}>
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
