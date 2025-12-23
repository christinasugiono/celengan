import { TransactionOwner } from '@/types/transaction';
import { cn } from '@/lib/utils';

interface OwnerBadgeProps {
  owner: TransactionOwner;
}

export function OwnerBadge({ owner }: OwnerBadgeProps) {
  const config = {
    me: { label: 'You', className: 'bg-primary text-primary-content' },
    partner: { label: 'Partner', className: 'bg-secondary text-secondary-content' },
    shared: { label: 'Shared', className: 'bg-accent text-accent-content' },
  };

  const { label, className } = config[owner];

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium opacity-80',
        className
      )}
    >
      {label}
    </span>
  );
}
