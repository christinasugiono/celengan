import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import {
  profiles,
  groups,
  groupMembers,
  categories,
  budgets,
  budgetItems,
} from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { groupName, monthlyIncomeRupiah, budgetItems: budgetItemsPayload } = body

    if (!groupName || !groupName.trim()) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      )
    }

    // Convert rupiah to cents (or keep as is if storing rupiah integers)
    const monthlyIncomeCents =
      monthlyIncomeRupiah != null ? Math.round(monthlyIncomeRupiah * 100) : null

    // Get current month start date (YYYY-MM-01)
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0]

    // Use a transaction to ensure all operations succeed or fail together
    await db.transaction(async (tx) => {
      // 1. Update profile (note: onboardingCompleted is per-user, but onboarding is per-group)
      // We still mark it as completed since user has completed onboarding for at least one group
      await tx
        .update(profiles)
        .set({
          monthlyIncomeCents,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id))

      // 2. Create the group with the provided name
      const [newGroup] = await tx
        .insert(groups)
        .values({
          name: groupName.trim(),
          defaultCurrency: "IDR",
          createdByProfileId: user.id,
        })
        .returning()

      // 3. Add the current user as a member with "owner" role (admin/owner permissions)
      // This ensures the group creator has full control over the group
      await tx.insert(groupMembers).values({
        groupId: newGroup.id,
        profileId: user.id,
        role: "owner", // "owner" is the highest role (equivalent to admin)
      })

      const groupId = newGroup.id

      // 4. Set this group as the active group for the user
      await tx
        .update(profiles)
        .set({
          activeGroupId: groupId,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id))

      // 3. Seed default categories first
      const DEFAULT_CATEGORIES = [
        { name: "Rent", kind: "expense" as const },
        { name: "Utilities: Electricity", kind: "expense" as const },
        { name: "Utilities: Water", kind: "expense" as const },
        { name: "Utilities: Gas", kind: "expense" as const },
        { name: "Food (eating out)", kind: "expense" as const },
        { name: "Groceries", kind: "expense" as const },
        { name: "Shopping", kind: "expense" as const },
        { name: "Hobbies", kind: "expense" as const },
        { name: "Travel", kind: "expense" as const },
        { name: "Transportation", kind: "expense" as const },
        { name: "Healthcare", kind: "expense" as const },
        { name: "Entertainment", kind: "expense" as const },
        { name: "Salary", kind: "income" as const },
        { name: "Investment", kind: "income" as const },
        { name: "Freelance", kind: "income" as const },
        { name: "Gift", kind: "income" as const },
      ]

      // Get existing categories to avoid duplicates
      const existingCategories = await tx
        .select()
        .from(categories)
        .where(eq(categories.groupId, groupId))

      const existingNames = new Set(existingCategories.map((c) => c.name))

      // Insert only categories that don't exist
      const categoriesToInsert = DEFAULT_CATEGORIES.filter(
        (cat) => !existingNames.has(cat.name)
      )

      if (categoriesToInsert.length > 0) {
        await tx.insert(categories).values(
          categoriesToInsert.map((cat) => ({
            groupId,
            name: cat.name,
            kind: cat.kind,
          }))
        )
      }

      // 4. Create or upsert categories from budget items
      const categoryMap = new Map<string, string>() // name -> categoryId

      for (const item of budgetItemsPayload || []) {
        const { name, kind = "expense" } = item

        // Check if category already exists
        const existing = await tx
          .select()
          .from(categories)
          .where(
            and(eq(categories.groupId, groupId), eq(categories.name, name))
          )
          .limit(1)

        let categoryId: string
        if (existing.length > 0) {
          categoryId = existing[0].id
        } else {
          // Create new category
          const [newCategory] = await tx
            .insert(categories)
            .values({
              groupId,
              name,
              kind,
            })
            .returning()
          categoryId = newCategory.id
        }

        categoryMap.set(name, categoryId)
      }

      // 5. Create monthly budget for current month
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const monthName = monthNames[now.getMonth()]
      const [budget] = await tx
        .insert(budgets)
        .values({
          groupId,
          name: `Budget ${monthName} ${now.getFullYear()}`,
          period: "monthly",
          periodStart,
          currency: "IDR",
          createdByProfileId: user.id,
        })
        .returning()

      // 6. Create budget_items for each category with a limit
      if (budgetItemsPayload && budgetItemsPayload.length > 0) {
        const itemsToInsert = budgetItemsPayload.map(
          (item: { name: string; limitRupiah: number; kind?: string }) => {
            const categoryId = categoryMap.get(item.name)
            if (!categoryId) {
              throw new Error(`Category not found: ${item.name}`)
            }

            return {
              budgetId: budget.id,
              categoryId,
              limitCents: Math.round(item.limitRupiah * 100), // Convert to cents
            }
          }
        )

        await tx.insert(budgetItems).values(itemsToInsert)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding completion error:", error)
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
