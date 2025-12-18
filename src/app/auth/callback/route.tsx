import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in", url.origin))
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=auth", url.origin))
  }

  // 👇 Always start at onboarding
  return NextResponse.redirect(new URL("/onboarding", url.origin))
}
