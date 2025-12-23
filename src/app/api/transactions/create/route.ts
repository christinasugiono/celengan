import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { groups, groupMembers, transactions } from "@/lib/db/schema"
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
    const {
      groupId,
      occurredAt,
      amountCents,
      currency = "IDR",
      direction,
      description,
      note,
      categoryId,
      accountId,
      owner = "mine",
    } = body

    // Validation
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      )
    }

    if (!occurredAt) {
      return NextResponse.json(
        { error: "Transaction date is required" },
        { status: 400 }
      )
    }

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    if (!direction || !["income", "expense"].includes(direction)) {
      return NextResponse.json(
        { error: "Valid direction (income/expense) is required" },
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

    // Create transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        groupId,
        occurredAt,
        amountCents: Math.round(amountCents),
        currency,
        direction,
        description: description?.trim() || null,
        note: note?.trim() || null,
        categoryId: categoryId || null,
        accountId: accountId || null,
        createdByProfileId: user.id,
        owner,
      })
      .returning()

    return NextResponse.json({ success: true, transaction: newTransaction })
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
