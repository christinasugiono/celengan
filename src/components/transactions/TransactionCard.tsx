import { Transaction } from '@/types/transaction';
import { formatCurrency, formatRelativeDate } from '@/lib/format';
import { OwnerBadge } from './OwnerBadge';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
}

// Simple category icon mapping - you can enhance this later
const getCategoryIcon = (category: string): string => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('grocery')) {
    return '🍔';
  } else if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('uber')) {
    return '🚗';
  } else if (categoryLower.includes('shopping') || categoryLower.includes('store')) {
    return '🛍️';
  } else if (categoryLower.includes('bills') || categoryLower.includes('utility')) {
    return '💡';
  } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie')) {
    return '🎬';
  } else if (categoryLower.includes('health') || categoryLower.includes('medical')) {
    return '🏥';
  } else if (categoryLower.includes('salary') || categoryLower.includes('income')) {
    return '💰';
  }
  return '📋';
};

const getCategoryColor = (category: string): string => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('grocery')) {
    return '#FF6B6B';
  } else if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('uber')) {
    return '#4ECDC4';
  } else if (categoryLower.includes('shopping') || categoryLower.includes('store')) {
    return '#FFE66D';
  } else if (categoryLower.includes('bills') || categoryLower.includes('utility')) {
    return '#95E1D3';
  } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie')) {
    return '#F38181';
  } else if (categoryLower.includes('health') || categoryLower.includes('medical')) {
    return '#AA96DA';
  } else if (categoryLower.includes('salary') || categoryLower.includes('income')) {
    return '#A8E6CF';
  }
  return '#C8C5BF';
};

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const icon = getCategoryIcon(transaction.category);
  const color = getCategoryColor(transaction.category);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
        'hover:bg-base-300 active:scale-[0.99]',
        'text-left group'
      )}
    >
      {/* Category Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content truncate">
            {transaction.merchant}
          </span>
          {transaction.isRecurring && (
            <RefreshCw className="w-3 h-3 text-base-content/50 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-base-content/70 truncate">
            {transaction.description}
          </span>
        </div>
      </div>

      {/* Amount & Meta */}
      <div className="text-right shrink-0">
        <div
          className={cn(
            'font-semibold text-base-content',
            transaction.direction === 'expense' && 'text-error',
            transaction.direction === 'income' && 'text-success'
          )}
        >
          {transaction.direction === 'expense' ? '-' : transaction.direction === 'income' ? '+' : ''}
          {formatCurrency(transaction.amount, transaction.currency)}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 justify-end">
          <span className="text-xs text-base-content/50">
            {formatRelativeDate(transaction.date)}
          </span>
          <OwnerBadge owner={transaction.owner} />
        </div>
      </div>
    </button>
  );
}
