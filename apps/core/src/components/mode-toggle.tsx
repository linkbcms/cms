'use client';

import { useTheme } from '@/components/theme-provider';
import { IconBrightness } from '@tabler/icons-react';
import { Button } from '@linkbcms/ui/components/button';
import { useCallback } from 'react';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle size-8"
      onClick={toggleTheme}
    >
      <IconBrightness />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
