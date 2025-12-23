import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { groups, groupMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next")

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in", url.origin))
  }

  const supabase = createSupabaseServerClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=auth", url.origin))
  }

  // If next parameter is provided, use it (e.g., from sign-in redirect)
  if (next) {
    return NextResponse.redirect(new URL(next, url.origin))
  }

  // Check if user has any groups (has completed onboarding for at least one group)
  const userGroups = await db
    .select()
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.profileId, data.user.id))
    .limit(1)

  // If user has groups, they've completed onboarding - go to dashboard
  // Otherwise, redirect to onboarding to create their first group
  if (userGroups.length > 0) {
    return NextResponse.redirect(new URL("/dashboard", url.origin))
  }

  return NextResponse.redirect(new URL("/onboarding", url.origin))
}
