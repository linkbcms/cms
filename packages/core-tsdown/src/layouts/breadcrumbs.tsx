'use client';

import type { CollectionsMap } from '@linkbcms/core-config';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@linkbcms/ui/components/breadcrumb';
import { Button } from '@linkbcms/ui/components/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@linkbcms/ui/components/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@linkbcms/ui/components/dropdown-menu';
import { useIsMobile } from '@linkbcms/ui/hooks/use-mobile';
import { Fragment, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useConfigContext } from '@/store/use-config.context';

const breadcrumbTextsMap = {
  collections: 'Collections',
  singletons: 'Singletons',
  'custom-collections': 'Custom Collections',
};

const ITEMS_TO_DISPLAY = 3;

const MAX_LENGTH_BREADCRUMB_TEXT = 30;

export function BreadcrumbResponsive() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

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
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={'/'}>Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbFirst.filter((item) => item.text !== undefined).length >
          0 && <BreadcrumbSeparator />}
        {breadcrumbFirst.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              {isDesktop ? (
                <DropdownMenu onOpenChange={setOpen} open={open}>
                  <DropdownMenuTrigger
                    aria-label="Toggle menu"
                    className="flex items-center gap-1"
                  >
                    <BreadcrumbEllipsis className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {breadcrumbFirst.slice(-2).map((item, index) => (
                      <DropdownMenuItem key={`${item.path}-${index}`}>
                        <Link to={item.link ? item.link : '#'}>
                          {item.text}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer onOpenChange={setOpen} open={open}>
                  <DrawerTrigger aria-label="Toggle Menu">
                    <BreadcrumbEllipsis className="h-4 w-4" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle>Navigate to</DrawerTitle>
                      <DrawerDescription>
                        Select a page to navigate to.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {breadcrumbFirst.slice(-2).map((item, index) => (
                        <Link
                          className="py-1 text-sm"
                          key={`${item.path}-${index}`}
                          to={item.link ? item.link : '#'}
                        >
                          {item.text}
                        </Link>
                      ))}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        {breadcrumbFirst.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
          <Fragment key={`${item.path}-${index}`}>
            {item.link ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className="max-w-20 truncate md:max-w-none"
                  >
                    <Link to={item.link}>{item.text}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                {item.text}
              </BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
