import { Transaction } from '@/types/transaction';
import { TransactionCard } from './TransactionCard';
import { motion } from 'framer-motion';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/70">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          <TransactionCard
            transaction={transaction}
            onClick={() => onTransactionClick?.(transaction)}
          />
        </motion.div>
      ))}
    </div>
  );
}
