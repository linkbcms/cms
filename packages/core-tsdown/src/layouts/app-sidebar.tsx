'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@linkbcms/ui/components/sidebar';
import {
  BookOpen,
  Bot,
  Bug,
  Command,
  File,
  Frame,
  LibraryBig,
  MapIcon,
  MessageCircleCode,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import type * as React from 'react';
import type { JSX } from 'react/jsx-runtime';
import { Link } from 'wouter';
import { NavMain } from '@/layouts/nav-main';
import { NavSecondary } from '@/layouts/nav-secondary';

import { useCollections } from '@/hooks/use-collections';

const data = {
  user: {
    name: 'user',
    email: 'user@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Discussions',
      url: 'https://github.com/linkb15/cms/discussions',
      icon: MessageCircleCode,
    },
    {
      title: 'Issues?',
      url: 'https://github.com/linkb15/cms/issues',
      icon: Bug,
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: MapIcon,
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>): JSX.Element {
  const { config, collections, singletons, customCollections } =
    useCollections();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            <SidebarMenuButton asChild size="lg">
              <Link to="/">
                {config?.ui?.logo ? (
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <config.ui.logo />
                  </div>
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                )}

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {config?.ui?.name}
                  </span>
                  {/* <span className='truncate text-xs'>Enterprise</span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* <SidebarMenuItem className='w-full'>
            <SidebarMenuButton
              size='lg'
              onClick={() => {
                console.log(config$.ui.name.get())

                if (config$.ui.name.get()) {
                  config$.ui.name.set(undefined)
                } else {
                  config$.ui.name.set('CMS')
                }
              }}>
              Test
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={collections.map(([key, value]) => ({
            title: value?.label || '',
            url: `/collections/${key}`,
            icon: LibraryBig,
          }))}
          title="Collections"
        />
        <NavMain
          items={singletons.map(([key, value]) => ({
            title: value?.label || '',
            url: `/singletons/${key}`,
            icon: File,
          }))}
          title="Singletons"
        />
        {customCollections.length > 0 && (
          <NavMain
            items={customCollections.map(([key, value]) => ({
              title: value?.label || '',
              url: `/custom-collections/${key}`,
              icon: Bot,
            }))}
            title="Custom Collections"
          />
        )}
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
