import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { Logo } from '@/app/icons/logo';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      searchToggle={{
        enabled: false,
      }}
      themeSwitch={{
        enabled: false,
      }}
      nav={{
        title: (
          <>
            <Logo />
            LinkbCMS
          </>
        ),
      }}
      links={[
        {
          text: 'Features',
          url: '#features',
          active: 'nested-url',
        },
        {
          text: 'Pricing',
          url: '#pricing',
          active: 'nested-url',
        },
        {
          text: 'FAQ',
          url: '#faq',
          active: 'nested-url',
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
