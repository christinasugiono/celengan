export type TransactionOwner = 'me' | 'partner' | 'shared';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number; // in currency units (not cents)
  currency: string;
  direction: 'income' | 'expense' | 'transfer';
  merchant: string;
  description: string;
  category: string;
  owner: TransactionOwner;
  isRecurring?: boolean;
}
