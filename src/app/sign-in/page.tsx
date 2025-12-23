"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import Link from "next/link"
import { Rocket, CheckCircle2, ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // User is authenticated, check if they have groups
        try {
          const response = await fetch("/api/onboarding/check")
          if (response.ok) {
            const data = await response.json()
            if (data.hasGroups) {
              router.push("/dashboard")
            } else {
              router.push("/onboarding")
            }
          } else {
            // If check fails, still redirect to dashboard
            router.push("/dashboard")
          }
        } catch {
          // If check fails, still redirect to dashboard
          router.push("/dashboard")
        }
      } else {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) setError(error.message)
    else setSent(true)

    setLoading(false)
  }

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-base-100 text-base-content relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-base-100 text-base-content relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="mx-auto max-w-md px-5 py-14 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-12 text-base-content/80 hover:text-base-content transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to home</span>
        </Link>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center shadow-lg">
              <span className="text-2xl">🐷</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary text-gradient">Celengan</span>
          </Link>
        </div>

        <div className="card bg-base-200/80 backdrop-blur-md border border-base-300/50 shadow-xl text-base-content">
          <div className="card-body p-8">
            {sent ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2">Check your email</h2>
                  <p className="text-base-content/85">
                    I sent a sign-in link to <span className="font-semibold text-base-content">{email}</span>.
                  </p>
                </div>
                <p className="text-sm text-base-content/75 italic">
                  Because accounts don&apos;t sign in themselves. (Sadly.)
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                  className="btn btn-ghost btn-sm mt-2"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-base-content mb-2">Sign in</h1>
                  <p className="text-base-content/85">Let&apos;s get you in.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <label className="input validator">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </g>
                    </svg>
                    <input type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="focus-visible:outline-none"
                    />
                  </label>
                  <div className="validator-hint hidden">Enter valid email address</div>

                  {error && (
                    <div className="alert alert-error text-error-content shadow-lg">
                      <span>{error}</span>
                    </div>
                  )}

                  <button className="btn btn-primary w-full gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Sending…
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Send magic link
                      </>
                    )}
                  </button>

                  <p className="text-sm text-base-content/75 text-center italic pt-2">
                    Because money doesn&apos;t track itself. Neither do logins.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
