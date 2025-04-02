'use client'

import {
  BookOpen,
  Bot,
  Bug,
  Command,
  Frame,
  LifeBuoy,
  MapIcon,
  MessageCircleCode,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from 'lucide-react'
import type * as React from 'react'

import { ModeToggle } from '@/components/mode-toggle'
import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@linkbcms/ui/components/sidebar'
import { useConfig } from '@/components/config-provider'
import { Memo, Show } from '@legendapp/state/react'

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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const config$ = useConfig()

  const fullCollections = Object.entries(config$.collections)

  const collections = fullCollections.filter(([key, value]) => {
    if ('fieldSlug' in value.get()) {
      return true
    }

    return false
  })

  const singletons = fullCollections.filter(([key, value]) => {
    if ('fieldSlug' in value.get() || 'Component' in value.get()) {
      return false
    }

    return true
  })

  const customCollections = fullCollections.filter(([key, value]) => {
    if ('Component' in value.get()) {
      console.log(value.get())
      return true
    }
    return false
  })

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className='w-full'>
            <SidebarMenuButton size='lg' asChild>
              <a href='/cms'>
                <Show
                  if={config$?.ui?.logo}
                  else={() => (
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                      <Command className='size-4' />
                    </div>
                  )}>
                  <div className='flex aspect-square size-8 items-center justify-center'>
                    {config$?.ui?.logo?.get()}
                  </div>
                </Show>

                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    <Memo>{config$.ui.name}</Memo>
                  </span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className='w-full'>
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          title='Collections'
          items={collections.map(([key, value]) => ({
            title: value.get().label,
            url: `/cms/collections/${key}`,
            icon: Bot,
          }))}
        />
        <NavMain
          title='Singletons'
          items={singletons.map(([key, value]) => ({
            title: value.get().label,
            url: `/cms/singletons/${key}`,
            icon: Bot,
          }))}
        />
        <NavMain
          title='Custom Collections'
          items={customCollections.map(([key, value]) => ({
            title: value.get().label,
            url: `/cms/custom-collections/${key}`,
            icon: Bot,
          }))}
        />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
