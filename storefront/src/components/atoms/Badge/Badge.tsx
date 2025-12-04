import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 label-sm leading-none text-action-on-primary bg-action rounded-xs',
        className
      )}
    >
      {children}
    </span>
  );
}
