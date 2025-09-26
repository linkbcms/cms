import type { CollectionsMap } from '@linkbcms/core-config';
import { Button } from '@linkbcms/ui/components/button';
import { Separator } from '@linkbcms/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@linkbcms/ui/components/sidebar';
import { Plus } from 'lucide-react';
import pluralize from 'pluralize';
import { useMemo } from 'react';
import type { JSX } from 'react/jsx-runtime';
import { Link, useLocation } from 'wouter';
import { AppSidebar } from '@/layouts/app-sidebar';
import { BreadcrumbResponsive } from '@/layouts/breadcrumbs';
import { useConfigContext } from '@/store/use-config.context';

const breadcrumbTextsMap = {
  collections: 'Collections',
  singletons: 'Singletons',
  'custom-collections': 'Custom Collections',
};

const MAX_LENGTH_BREADCRUMB_TEXT = 30;

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [pathname] = useLocation();

  const config = useConfigContext((s) => s.config);

  const breadcrumbFirst = useMemo(() => {
    const path = pathname.split('/').filter(Boolean);
    const first = path[0] as keyof typeof breadcrumbTextsMap;
    const second = path[1] as keyof CollectionsMap;
    const third = path[2];

    return [
      { link: undefined, text: breadcrumbTextsMap[first], path: first },
      {
        link: third ? `/${first}/${second}` : undefined,
        text: config?.collections?.[second]?.label,
        path: second,
      },
      {
        link: undefined,
        text:
          third !== undefined && third?.length > MAX_LENGTH_BREADCRUMB_TEXT
            ? `${third.slice(0, MAX_LENGTH_BREADCRUMB_TEXT)}...`
            : third,
        path: third,
      },
    ];
  }, [pathname, config?.collections]);

  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-sidebar md:top-2">
          <div className="-top-2 absolute hidden size-full h-2 bg-sidebar md:block" />
          <div className="flex h-full w-full items-center justify-between gap-2 bg-background px-4 md:rounded-t-xl">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 h-4 max-h-4" orientation="vertical" />
              <BreadcrumbResponsive />
            </div>

            {breadcrumbFirst?.[0]?.path === 'collections' &&
              !breadcrumbFirst?.[2]?.path && (
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/${pathname}/add/new`}>
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
                  <Button asChild variant="outline">
                    <Link
                      to={`/${breadcrumbFirst?.[0]?.path}/${breadcrumbFirst?.[1]?.path}/add/new`}
                    >
                      <Plus className="h-4 w-4" />
                      Add new{' '}
                      {pluralize.singular(breadcrumbFirst?.[1]?.text || '')}
                    </Link>
                  </Button>

                  {/* <DeleteCollection /> */}
                </div>
              )}
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
