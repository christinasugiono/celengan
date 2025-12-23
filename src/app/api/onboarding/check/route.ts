import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { groups, groupMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ hasGroups: false })
    }

    // Check if user has any groups
    const userGroups = await db
      .select()
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.profileId, user.id))
      .limit(1)

    return NextResponse.json({ hasGroups: userGroups.length > 0 })
  } catch (error) {
    console.error("Error checking groups:", error)
    return NextResponse.json({ hasGroups: false })
  }
}
