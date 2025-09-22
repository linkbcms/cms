import { reactive } from '@legendapp/state/react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@linkbcms/ui/components/sidebar';
import { Switch } from '@linkbcms/ui/components/switch';
import { IconBrightness } from '@tabler/icons-react';
import type { LucideIcon } from 'lucide-react';
import type * as React from 'react';
import type { JSX } from 'react/jsx-runtime';
import { Link } from 'react-router';
import { useConfig } from '@/components/config-provider';

const ReactiveSwitch = reactive(Switch);

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>): JSX.Element {
  const config$ = useConfig();
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem className="">
            <SidebarMenuButton asChild size="sm" tooltip={'Dark Mode'}>
              <label htmlFor="dark-mode-toggle">
                <IconBrightness />
                <span className="group-data-[collapsible=icon]:hidden">
                  Dark Mode
                </span>

                <ReactiveSwitch
                  $checked={() =>
                    config$.ui.theme.defaultTheme.get() !== 'light'
                  }
                  className="ml-auto group-data-[collapsible=icon]:hidden"
                  id="dark-mode-toggle"
                  onCheckedChange={() =>
                    config$.ui.theme.defaultTheme.set((v) =>
                      v === 'light' ? 'dark' : 'light'
                    )
                  }
                />
              </label>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
