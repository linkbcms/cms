import { AppSidebar } from '@/components/app-sidebar';
import { useConfig } from '@/components/config-provider';
import { useObserveTheme } from '@/components/use-observe-theme';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@linkbcms/ui/components/breadcrumb';
import { Separator } from '@linkbcms/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@linkbcms/ui/components/sidebar';
import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';

const breadcrumbTextsMap = {
  collections: 'Collections',
  singletons: 'Singletons',
  'custom-collections': 'Custom Collections',
};

export default function Layout() {
  useObserveTheme();

  const { pathname } = useLocation();

  const config = useConfig();

  const breadcrumbFirst = useMemo(() => {
    const path = pathname.split('/').filter(Boolean);
    const first = path[0] as keyof typeof breadcrumbTextsMap;
    const second = path[1] as keyof typeof config.collections;

    return [breadcrumbTextsMap[first], config.collections[second].label.get()];
  }, [pathname, config.collections]);

  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-sidebar md:top-2">
          <div className="-top-2 absolute hidden size-full h-2 bg-sidebar md:block" />
          <div className="flex h-full w-full items-center gap-2 bg-background px-4 md:rounded-t-xl">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 max-h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbFirst?.[0] && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      {breadcrumbFirst[0]}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {breadcrumbFirst?.[1] || 'Dashboard'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
