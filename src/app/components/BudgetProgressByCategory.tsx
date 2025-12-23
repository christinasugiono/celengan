interface BudgetCategory {
  categoryId: string
  categoryName: string
  limitCents: number
  spentCents: number
}

interface BudgetProgressByCategoryProps {
  categories: BudgetCategory[]
  currency: string
  formatAmount: (cents: number, currency: string) => string
}

export default function BudgetProgressByCategory({
  categories,
  currency,
  formatAmount,
}: BudgetProgressByCategoryProps) {
  // Sort by fulfillment percentage (highest first)
  const sortedCategories = [...categories].sort((a, b) => {
    const aPercentage = a.limitCents > 0 ? (a.spentCents / a.limitCents) * 100 : 0
    const bPercentage = b.limitCents > 0 ? (b.spentCents / b.limitCents) * 100 : 0
    return bPercentage - aPercentage
  })

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <div className="card bg-base-200/80 border border-base-300/50 shadow-lg">
      <div className="card-body p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-4 sm:mb-6">
          Your Budget Spendings
        </h2>

        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const percentage = category.limitCents > 0
              ? Math.min((category.spentCents / category.limitCents) * 100, 100)
              : 0
            const isOverBudget = category.spentCents > category.limitCents

            return (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-base-content break-words truncate">
                      {category.categoryName}
                    </h3>
                    {isOverBudget && (
                      <span className="badge badge-error badge-sm shrink-0">Over Budget</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 shrink-0">
                  <span className="text-xs sm:text-sm text-base-content/70 break-words">
                      {formatAmount(category.spentCents, currency)} /{" "}
                      {formatAmount(category.limitCents, currency)}
                    </span>
                    <span className="text-xs sm:text-sm text-base-content/70 shrink-0">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <progress
                  className={`progress w-full ${
                    percentage >= 100
                      ? "progress-error"
                      : percentage >= 80
                      ? "progress-warning"
                      : "progress-primary"
                  }`}
                  value={Math.min(percentage, 100)}
                  max="100"
                ></progress>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
