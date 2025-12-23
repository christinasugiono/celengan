interface IncomeExpensePieChartProps {
  income: number
  expenses: number
  currency: string
  formatAmount: (cents: number, currency: string) => string
}

export default function IncomeExpensePieChart({
  income,
  expenses,
  currency,
  formatAmount,
}: IncomeExpensePieChartProps) {
  // Show expenses as portion of income (income eaten by expenses)
  const expensesPercentage = income > 0 ? Math.min((expenses / income) * 100, 100) : 0
  const remainingPercentage = income > 0 ? Math.max(100 - expensesPercentage, 0) : 0
  const netAmount = income - expenses

  // Calculate the stroke-dasharray for the pie chart
  // We'll use two radial progress circles - one for income, one for expenses
  // But actually, let's create a simple pie chart using SVG or use DaisyUI's radial progress creatively

  return (
    <div className="card bg-base-200/80 border border-base-300/50 shadow-lg">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Pie Chart Visualization */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-base-300"
              />
              {/* Expenses arc (red) - shows how much income is eaten */}
              {expensesPercentage > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-error"
                  strokeDasharray={`${expensesPercentage * 2.827} 282.7`}
                  strokeLinecap="round"
                />
              )}
              {/* Remaining income arc (green) - shows what's left */}
              {remainingPercentage > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-success"
                  strokeDasharray={`${remainingPercentage * 2.827} 282.7`}
                  strokeDashoffset={`-${expensesPercentage * 2.827}`}
                  strokeLinecap="round"
                />
              )}
            </svg>
            {/* Center text overlay showing net total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold break-words text-center ${netAmount >= 0 ? "text-success" : "text-error"}`}>
                {netAmount >= 0 ? "+" : "-"}
                <span className="break-all">
                  {formatAmount(Math.abs(netAmount), currency)
                    .replace(/[^\d.,]/g, "")
                    .slice(0, 12)}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-4 h-4 rounded-full bg-error shrink-0 mt-0.5"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-base-content break-words">Expenses</p>
                <p className="text-lg font-bold text-error break-words">
                  {formatAmount(expenses, currency)}
                </p>
                <p className="text-xs text-base-content/70 break-words">
                  {expensesPercentage.toFixed(1)}% of income
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-4 h-4 rounded-full bg-success shrink-0 mt-0.5"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-base-content break-words">Remaining Income</p>
                <p className="text-lg font-bold text-success break-words">
                  {formatAmount(Math.max(netAmount, 0), currency)}
                </p>
                <p className="text-xs text-base-content/70 break-words">
                  {remainingPercentage.toFixed(1)}% of income
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
