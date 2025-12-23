import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { profiles, groups, groupMembers, transactions, categories } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import DashboardNavbar from "@/app/components/DashboardNavbar"
import Dock from "@/app/components/Dock"
import FloatingActionButton from "@/app/components/FloatingActionButton"
import { TransactionsClient } from "./TransactionsClient"
import { Transaction, TransactionOwner } from "@/types/transaction"

export default async function TransactionsPage() {
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
    .orderBy(desc(groups.createdAt))

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

  // Fetch all transactions for the active group
  const dbTransactions = await db
    .select({
      id: transactions.id,
      occurredAt: transactions.occurredAt,
      amountCents: transactions.amountCents,
      currency: transactions.currency,
      direction: transactions.direction,
      description: transactions.description,
      note: transactions.note,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      owner: transactions.owner,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.groupId, activeGroup.id))
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))

  // Map database transactions to Transaction type
  const mappedTransactions: Transaction[] = dbTransactions.map((t) => {
    // Map owner: "mine" -> "me", "other" -> "partner", "shared" -> "shared"
    let owner: TransactionOwner = 'me';
    if (t.owner === 'shared') {
      owner = 'shared';
    } else if (t.owner === 'other') {
      owner = 'partner';
    }

    // Convert amountCents to amount
    const amount = Number(t.amountCents) / 100;

    // Extract merchant and description from the combined description field
    // Format is typically "merchant - description" or just "merchant"
    let merchant = 'Unknown';
    let description = '';

    if (t.description) {
      const parts = t.description.split(' - ');
      merchant = parts[0] || 'Unknown';
      description = parts.slice(1).join(' - ') || '';
    }

    // Use note as additional description if available
    if (t.note) {
      description = description ? `${description} ${t.note}` : t.note;
    }

    return {
      id: t.id,
      date: t.occurredAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      amount,
      currency: t.currency,
      direction: t.direction as 'income' | 'expense' | 'transfer',
      merchant,
      description: description || merchant,
      category: t.categoryName || 'Uncategorized',
      owner,
    };
  });

  return (
    <main className="min-h-screen bg-base-100 text-base-content pb-20 sm:pb-16" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      <DashboardNavbar activeGroupName={activeGroup.name} activeGroupId={activeGroup.id} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        <TransactionsClient initialTransactions={mappedTransactions} />
      </div>

      <FloatingActionButton />
      <Dock />
    </main>
  )
}
