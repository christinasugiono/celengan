import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { groupMembers, profiles } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is a member of this group
    const userMembership = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.profileId, user.id)
        )
      )
      .limit(1)

    if (userMembership.length === 0) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      )
    }

    // Get all members of the group with their profile info
    const members = await db
      .select({
        id: groupMembers.id,
        profileId: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        role: groupMembers.role,
        joinedAt: groupMembers.createdAt,
      })
      .from(groupMembers)
      .innerJoin(profiles, eq(groupMembers.profileId, profiles.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(groupMembers.createdAt)

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Group members fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch group members" },
      { status: 500 }
    )
  }
}
