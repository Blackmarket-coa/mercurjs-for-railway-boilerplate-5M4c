import { cn } from '@/lib/utils';

export const TabsTrigger = ({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) => {
  return (
    <p
      className={cn(
        'capitalize cursor-pointer px-2 pb-2',
        isActive && 'border-b border-primary font-bold'
      )}
    >
      {children}
    </p>
  );
};
