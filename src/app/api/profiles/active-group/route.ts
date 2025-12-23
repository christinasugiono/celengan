import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { profiles, groupMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
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
        { error: "Not a member of this group" },
        { status: 403 }
      )
    }

    // Update the active group
    await db
      .update(profiles)
      .set({
        activeGroupId: groupId,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))

    return NextResponse.json({ success: true, activeGroupId: groupId })
  } catch (error) {
    console.error("Update active group error:", error)
    return NextResponse.json(
      { error: "Failed to update active group" },
      { status: 500 }
    )
  }
}
