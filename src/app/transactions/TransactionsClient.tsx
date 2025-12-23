'use client';

import { useState } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Transaction, TransactionOwner } from '@/types/transaction';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type FilterOwner = TransactionOwner | 'all';

interface TransactionsClientProps {
  initialTransactions: Transaction[];
}

export function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<FilterOwner>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = initialTransactions.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOwner = ownerFilter === 'all' || t.owner === ownerFilter;

    return matchesSearch && matchesOwner;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-base-content">Transactions</h2>
        <p className="text-base-content/70 mt-0.5">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
              showFilters || ownerFilter !== 'all'
                ? 'bg-primary text-primary-content border-primary'
                : 'bg-base-200 border-base-300 hover:bg-base-300'
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 flex-wrap">
                {(['all', 'me', 'partner', 'shared'] as FilterOwner[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOwnerFilter(filter)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      ownerFilter === filter
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                    )}
                  >
                    {filter === 'all' ? 'All' : filter === 'me' ? 'You' : filter === 'partner' ? 'Partner' : 'Shared'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Groups */}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/70 px-1">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <div className="card bg-base-200/80 border border-base-300/50 shadow-lg overflow-hidden">
              <div className="card-body p-4 sm:p-6">
                <TransactionList transactions={groupedTransactions[date]} />
              </div>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-base-content/70">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
