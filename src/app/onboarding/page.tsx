import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()

  // If not logged in, go sign in
  if (!data.user) redirect("/sign-in")

  return (
    <main className="min-h-screen bg-base-100">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to Celengan
        </h1>

        <p className="mt-3 text-base-content/70">
          Let’s set things up so your money makes sense.
        </p>

        <div className="mt-8 card bg-base-200 border border-base-300">
          <div className="card-body space-y-4">
            <div>
              <h2 className="font-medium">How do you want to start?</h2>
              <p className="text-sm text-base-content/60">
                You can change this later.
              </p>
            </div>

            <ul className="list-disc list-inside text-sm text-base-content/70 space-y-1">
              <li>Add transactions manually</li>
              <li>Upload a bank statement</li>
              <li>Do it monthly or daily — both work</li>
            </ul>

            <form action="/onboarding/complete" method="post">
              <button className="btn btn-primary w-full">
                Start using Celengan
              </button>
            </form>

            <p className="text-xs text-base-content/60">
              Because money doesn’t track itself.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
