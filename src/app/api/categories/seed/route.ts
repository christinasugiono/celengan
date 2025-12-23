import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { groups, groupMembers, categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

// Default categories to seed
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
    const { groupId } = body

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      )
    }

    // Verify user is a member of this group
    const membership = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.profileId, user.id)
        )
      )
      .limit(1)

    if (membership.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      )
    }

    // Check existing categories
    const existingCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.groupId, groupId))

    const existingNames = new Set(existingCategories.map((c) => c.name))

    // Insert only categories that don't exist
    const categoriesToInsert = DEFAULT_CATEGORIES.filter(
      (cat) => !existingNames.has(cat.name)
    )

    if (categoriesToInsert.length > 0) {
      await db.insert(categories).values(
        categoriesToInsert.map((cat) => ({
          groupId,
          name: cat.name,
          kind: cat.kind,
        }))
      )
    }

    return NextResponse.json({
      success: true,
      added: categoriesToInsert.length,
      skipped: DEFAULT_CATEGORIES.length - categoriesToInsert.length,
    })
  } catch (error) {
    console.error("Category seeding error:", error)
    return NextResponse.json(
      { error: "Failed to seed categories" },
      { status: 500 }
    )
  }
}
