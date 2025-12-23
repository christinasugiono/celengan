import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { profiles, groups, groupMembers, transactions, categories, budgets, budgetItems } from "@/lib/db/schema"
import { eq, desc, sql, and, gte, lte } from "drizzle-orm"
import DashboardNavbar from "@/app/components/DashboardNavbar"
import Dock from "@/app/components/Dock"
import FloatingActionButton from "@/app/components/FloatingActionButton"
import IncomeExpensePieChart from "@/app/components/IncomeExpensePieChart"
import BudgetProgressByCategory from "@/app/components/BudgetProgressByCategory"

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in, redirect to sign in
  if (!user) {
    redirect("/sign-in")
  }

  // Get user profile to check activeGroupId
  const [userProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!userProfile) {
    redirect("/onboarding")
  }

  // Check if user has any groups
  const userGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      defaultCurrency: groups.defaultCurrency,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.profileId, user.id))
    .orderBy(desc(groups.createdAt)) // Most recent first

  // If user has no groups, redirect to onboarding
  if (userGroups.length === 0) {
    redirect("/onboarding")
  }

  // Get the active group - use activeGroupId from profile, or fall back to first group
  let activeGroup = userGroups.find((g) => g.id === userProfile.activeGroupId)
  if (!activeGroup) {
    // Fallback to first group if activeGroupId is not set (backward compatibility)
    activeGroup = userGroups[0]
    // Update profile with the first group as active
    await db
      .update(profiles)
      .set({ activeGroupId: activeGroup.id, updatedAt: new Date() })
      .where(eq(profiles.id, user.id))
  }

  // Get current month start and end dates
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Calculate stats for current month
  const stats = await db
    .select({
      totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.direction} = 'expense' THEN ${transactions.amountCents} ELSE 0 END), 0)`,
      totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.direction} = 'income' THEN ${transactions.amountCents} ELSE 0 END), 0)`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.groupId, activeGroup.id),
        gte(transactions.occurredAt, monthStart.toISOString().split("T")[0]),
        lte(transactions.occurredAt, monthEnd.toISOString().split("T")[0])
      )
    )

  const monthStats = stats[0] || { totalExpenses: 0, totalIncome: 0, transactionCount: 0 }

  // Fetch recent transactions for the active group
  const recentTransactions = await db
    .select({
      id: transactions.id,
      occurredAt: transactions.occurredAt,
      amountCents: transactions.amountCents,
      currency: transactions.currency,
      direction: transactions.direction,
      description: transactions.description,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.groupId, activeGroup.id))
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
    .limit(10)

  // Get current month budget if exists
  const currentBudget = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      totalLimitCents: budgets.totalLimitCents,
    })
    .from(budgets)
    .where(
      and(
        eq(budgets.groupId, activeGroup.id),
        eq(budgets.periodStart, monthStart.toISOString().split("T")[0])
      )
    )
    .limit(1)

  // Get budget items with spending by category
  const budgetCategories = currentBudget[0]
    ? await db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          limitCents: budgetItems.limitCents,
          spentCents: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.direction} = 'expense' THEN ${transactions.amountCents} ELSE 0 END), 0)`,
        })
        .from(budgetItems)
        .innerJoin(categories, eq(budgetItems.categoryId, categories.id))
        .leftJoin(
          transactions,
          and(
            eq(transactions.categoryId, categories.id),
            eq(transactions.groupId, activeGroup.id),
            gte(transactions.occurredAt, monthStart.toISOString().split("T")[0]),
            lte(transactions.occurredAt, monthEnd.toISOString().split("T")[0])
          )
        )
        .where(eq(budgetItems.budgetId, currentBudget[0].id))
        .groupBy(categories.id, categories.name, budgetItems.limitCents)
    : []

  // Format amount from cents to rupiah
  const formatAmount = (cents: number, currency: string) => {
    const amount = cents / 100
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
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

  return (
    <main className="min-h-screen bg-base-100 text-base-content pb-20 sm:pb-16" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      <DashboardNavbar activeGroupName={activeGroup.name} activeGroupId={activeGroup.id} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-base-content/80">Hey there! Here&apos;s what&apos;s going on with your money.</p>
        </div>

        <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Income vs Expenses Pie Chart - First thing to see */}
          <IncomeExpensePieChart
            income={monthStats.totalIncome}
            expenses={monthStats.totalExpenses}
            currency={activeGroup.defaultCurrency}
            formatAmount={formatAmount}
          />

          {/* Budget Progress by Category - Ordered by fulfillment */}
          {budgetCategories.length > 0 && (
            <BudgetProgressByCategory
              categories={budgetCategories}
              currency={activeGroup.defaultCurrency}
              formatAmount={formatAmount}
            />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card bg-base-200/80 border border-base-300/50 shadow-lg">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-base-content">What you&apos;ve been up to</h2>
              <a href="/transactions" className="btn btn-ghost btn-sm text-base-content hover:bg-base-200 hover:text-base-content">
                <span className="hidden sm:inline">See all</span>
                <span className="sm:hidden">All</span>
              </a>
            </div>
            {recentTransactions.length > 0 ? (
              <ul className="menu menu-vertical bg-base-100 rounded-box border border-base-300/50 p-2">
                {recentTransactions.map((transaction) => (
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
                          {transaction.direction === "expense" ? "-" : "+"}
                          {formatAmount(transaction.amountCents, transaction.currency)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-base-content/70 mb-4">Nothing here yet. Let&apos;s add your first transaction!</p>
                <a href="/dashboard/transactions/new" className="btn btn-primary btn-sm gap-2">
                  <span>+</span>
                  Add your first transaction
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton />
      <Dock />
    </main>
  )
}
