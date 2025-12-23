"use client"

interface Transaction {
  id: string
  occurredAt: Date | string
  amountCents: number
  currency: string
  direction: "income" | "expense" | "transfer"
  description: string | null
  note: string | null
  categoryId: string | null
  categoryName: string | null
}

interface Category {
  id: string
  name: string
}

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  currency: string
}

export default function TransactionsList({
  transactions,
  categories,
  currency,
}: TransactionsListProps) {
  // Format amount from cents to currency
  const formatAmount = (cents: number, currencyCode: string) => {
    const amount = cents / 100
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currencyCode || "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d)
  }
  if (transactions.length === 0) {
    return (
      <div className="card bg-base-200/80 border border-base-300/50 shadow-lg">
        <div className="card-body p-6 sm:p-8">
          <div className="text-center py-12">
            <p className="text-base-content/70 mb-4">Nothing here yet. Let&apos;s add your first transaction!</p>
            <a href="/dashboard/transactions/new" className="btn btn-primary btn-sm gap-2">
              <span>+</span>
              Add your first transaction
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-200/80 border border-base-300/50 shadow-lg">
      <div className="card-body p-4 sm:p-6">
        <ul className="menu menu-vertical bg-base-100 rounded-box border border-base-300/50 p-2">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="border-b border-base-300/50 last:border-b-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3 sm:py-2 px-2 hover:bg-base-200 rounded-lg transition-colors">
                <div className="flex-1 min-w-0 max-w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                    <h3 className="font-semibold text-sm sm:text-base text-base-content break-words overflow-hidden line-clamp-2">
                      {transaction.description || "No description"}
                    </h3>
                    {transaction.categoryName && (
                      <span className="badge badge-outline badge-xs sm:badge-sm text-base-content/70 self-start sm:self-center shrink-0">
                        {transaction.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-base-content/70 break-words">
                    {formatDate(transaction.occurredAt)}
                  </p>
                  {transaction.note && (
                    <p className="text-xs text-base-content/60 mt-1 italic break-words line-clamp-2">
                      {transaction.note}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p
                    className={`font-bold text-base sm:text-lg break-words ${
                      transaction.direction === "expense"
                        ? "text-error"
                        : transaction.direction === "income"
                        ? "text-success"
                        : "text-base-content"
                    }`}
                  >
                    {transaction.direction === "expense" ? "-" : transaction.direction === "income" ? "+" : ""}
                    {formatAmount(transaction.amountCents, transaction.currency)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
