import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { profiles, groups, groupMembers } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's profile to check activeGroupId
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    // Get user's groups
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

    // Mark which group is active
    const groupsWithActive = userGroups.map((group) => ({
      ...group,
      isActive: group.id === userProfile?.activeGroupId,
    }))

    return NextResponse.json({
      groups: groupsWithActive,
      activeGroupId: userProfile?.activeGroupId || null,
    })
  } catch (error) {
    console.error("Groups fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    )
  }
}
