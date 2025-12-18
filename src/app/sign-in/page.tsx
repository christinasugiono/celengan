"use client"

import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import Link from "next/link"

export default function SignInPage() {
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    })

    if (error) setError(error.message)
    else setSent(true)

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="mx-auto max-w-md px-5 py-14">
        <Link href="/" className="inline-flex items-center gap-3 mb-8 text-base-content">
          <div className="h-10 w-10 rounded-xl bg-secondary/20 grid place-items-center">
            <span className="text-xl">🐷</span>
          </div>
          <span className="text-xl font-bold">Celengan</span>
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-base-content">Sign in</h1>
        <p className="mt-2 text-base-content/80">Money, without the mystery.</p>

        <div className="mt-6 card bg-base-200 border border-base-300 text-base-content">
          <div className="card-body">
            {sent ? (
              <div className="space-y-2">
                <div className="text-lg font-medium text-base-content">Check your email</div>
                <p className="text-base-content/80">
                  We sent a sign-in link to <span className="font-medium text-base-content">{email}</span>.
                </p>
                <p className="text-sm text-base-content/70">
                  Because accounts don&apos;t sign in themselves. (Sadly.)
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                  className="btn btn-ghost btn-sm mt-4"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="form-control">
                  <span className="label-text text-base-content">Email</span>
                  <input
                    className="input input-bordered text-base-content bg-base-100"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </label>

                {error && <div className="alert alert-error text-error-content">{error}</div>}

                <button className="btn btn-primary w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send magic link"}
                </button>

                <p className="text-sm text-base-content/70">
                  Because money doesn&apos;t track itself. Neither do logins.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
