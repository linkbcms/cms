import { cn } from '@/lib/utils';
import type { JSX } from 'react/jsx-runtime';

function Skeleton({
  className,
  ...props
}: React.ComponentProps<'div'>): JSX.Element {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      {...props}
    />
  );
}

export { Skeleton };
