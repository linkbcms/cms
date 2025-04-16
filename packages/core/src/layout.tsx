import { AppSidebar } from '@/components/app-sidebar';
import { useConfig } from '@/components/config-provider';
import { useObserveTheme } from '@/components/use-observe-theme';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@linkbcms/ui/components/breadcrumb';
import { Button } from '@linkbcms/ui/components/button';
import { Separator } from '@linkbcms/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@linkbcms/ui/components/sidebar';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import pluralize from 'pluralize';
import { DeleteCollection } from '@/pages/delete-collection';
import type { JSX } from 'react/jsx-runtime';

const breadcrumbTextsMap = {
  collections: 'Collections',
  singletons: 'Singletons',
  'custom-collections': 'Custom Collections',
};

export default function Layout(): JSX.Element {
  useObserveTheme();

  const { pathname } = useLocation();

  const config = useConfig();

  const breadcrumbFirst = useMemo(() => {
    const path = pathname.split('/').filter(Boolean);
    const first = path[0] as keyof typeof breadcrumbTextsMap;
    const second = path[1] as keyof typeof config.collections;
    const third = path[2];

    return [
      { link: undefined, text: breadcrumbTextsMap[first], path: first },
      {
        link: third ? `/${first}/${second}` : undefined,
        text: config.collections[second]?.label.get(),
        path: second,
      },
      {
        link: undefined,
        text:
          third !== undefined && third?.length > 30
            ? `${third.slice(0, 30)}...`
            : third,
        path: third,
      },
    ];
  }, [pathname, config.collections]);

  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-sidebar md:top-2">
          <div className="-top-2 absolute hidden size-full h-2 bg-sidebar md:block" />
          <div className="flex h-full w-full items-center justify-between gap-2 bg-background px-4 md:rounded-t-xl">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 max-h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbFirst?.[0] && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        {breadcrumbFirst[0].text}
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    {breadcrumbFirst?.[1]?.link ? (
                      <BreadcrumbLink asChild>
                        <Link to={breadcrumbFirst?.[1]?.link}>
                          {breadcrumbFirst?.[1]?.text}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>
                        {breadcrumbFirst?.[1]?.text || 'Dashboard'}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>

                  {breadcrumbFirst?.[2]?.text && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        {breadcrumbFirst?.[2]?.link ? (
                          <BreadcrumbLink asChild>
                            <Link to={breadcrumbFirst?.[2]?.link}>
                              {breadcrumbFirst?.[2]?.text}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>
                            {breadcrumbFirst?.[2]?.text}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {breadcrumbFirst?.[0]?.path === 'collections' &&
              !breadcrumbFirst?.[2]?.path && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`${pathname}/add/new`}>
                      <Plus className="h-4 w-4" />
                      Add new{' '}
                      {pluralize.singular(breadcrumbFirst?.[1]?.text || '')}
                    </Link>
                  </Button>
                </div>
              )}

            {breadcrumbFirst?.[0]?.path === 'collections' &&
              breadcrumbFirst?.[2]?.path && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link
                      to={`${breadcrumbFirst?.[0]?.path}/${breadcrumbFirst?.[1]?.path}/add/new`}
                    >
                      <Plus className="h-4 w-4" />
                      Add new{' '}
                      {pluralize.singular(breadcrumbFirst?.[1]?.text || '')}
                    </Link>
                  </Button>

                  <DeleteCollection />
                </div>
              )}
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
