import {
  Info,
  Rocket,
  Check
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      {/* Navbar */}
      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/20 grid place-items-center">
              <span className="text-xl">🐷</span>
            </div>
            <span className="text-xl font-bold">Celengan</span>
          </div>
        </div>
        <div className="navbar-end gap-2">
          <a className="btn btn-ghost btn-sm gap-2" href="#how">
            <Info className="w-4 h-4" />
            How it works
          </a>
          <a className="btn btn-primary btn-sm gap-2" href="/sign-in">
            <Rocket className="w-4 h-4" />
            Get started
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="hero bg-base-200 min-h-[60vh]">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">
              Track Your Money,{" "}
              <span className="text-primary">Without the Mystery</span>
            </h1>
            <p className="py-6 text-lg">
              Join thousands who use Celengan to see where their money goes — clearly, calmly, and without extra effort.
            </p>
            <a href="/sign-in" className="btn btn-primary btn-lg gap-2">
              <Rocket className="w-5 h-5" />
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* Introduction Section - Single Column */}
      <section className="border-t border-base-300/60 bg-base-100">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="text-center space-y-4">
            <div className="text-sm text-primary font-medium uppercase tracking-wide">
              Introduction
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simplify Your Financial Tracking
            </h2>
            <p className="text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto">
              Upload statements, add screenshots, or enter transactions manually. Celengan organizes them,
              flags duplicates, and suggests categories — but nothing is saved without your review.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Grid Layout */}
      <section id="how" className="border-t border-base-300/60 bg-base-100">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Key Features
            </h2>
            <p className="text-lg text-base-content/60">
              Everything you need to take control of your finances
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base-content mb-1.5">Upload Any Format</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  Upload bank statements, drop screenshots, or enter transactions manually.
                  We support PDF, CSV, and image formats.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base-content mb-1.5">Smart Duplicate Detection</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  We automatically flag possible duplicate transactions. You review and confirm —
                  we never save anything without your approval.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base-content mb-1.5">Category Insights</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  See your spending broken down by category, month, and merchant.
                  Get clear insights into where your money goes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base-content mb-1.5">Privacy First</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  Your data stays on your device. No bank connections, no cloud sync.
                  You control everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="border-t border-base-300/60 bg-base-100">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-10 sm:p-14">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to take control?
              </h2>
              <p className="text-lg text-base-content/70">
                Start simple: upload one statement or add a few transactions.
                Celengan will handle the organizing — you stay in control.
              </p>
              <a href="/app" className="btn btn-primary btn-lg gap-2">
                <Rocket className="w-5 h-5" />
                Get Started Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center bg-base-200 text-base-content p-10 border-t border-base-300">
        <nav className="grid grid-flow-col gap-4">
          <a className="link link-hover">Privacy</a>
          <a className="link link-hover">Terms</a>
          <a className="link link-hover">Contact</a>
        </nav>
        <aside>
          <p>© {new Date().getFullYear()} Celengan. All rights reserved.</p>
        </aside>
      </footer>
    </main>
  );
}
