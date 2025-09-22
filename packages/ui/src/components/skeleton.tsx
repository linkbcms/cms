import type { JSX } from 'react/jsx-runtime';
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.ComponentProps<'div'>): JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
