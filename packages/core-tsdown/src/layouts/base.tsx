import { Button } from '@linkbcms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@linkbcms/ui/components/dropdown-menu';
import { Separator } from '@linkbcms/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@linkbcms/ui/components/sidebar';
import type { JSX } from 'react/jsx-runtime';
import { AppSidebar } from '@/layouts/app-sidebar';
import { BreadcrumbResponsive } from '@/layouts/breadcrumbs';
import { getLocale, setLocale } from '@/paraglide/runtime';

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="uppercase" size={'sm'} variant={'ghost'}>
                  {getLocale()}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                collisionPadding={{
                  right: 20,
                  left: 20,
                }}
              >
                <DropdownMenuItem onClick={() => setLocale('id')}>
                  EN
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('id')}>
                  ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
