"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PiggyBank, Users, Shield, Eye, ArrowRight, Check } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: "Built for Two",
      description: "Track spending together without the awkward money talks. Each transaction is clearly marked as yours, theirs, or shared."
    },
    {
      icon: Shield,
      title: "You Stay in Control",
      description: "Nothing saves automatically. Review every import, verify every duplicate, and decide what stays."
    },
    {
      icon: Eye,
      title: "Clarity, Not Judgment",
      description: "See where money goes without guilt trips, streaks, or shame. Just clear, honest numbers."
    }
  ];

  const howItWorks = [
    "Import your bank statement once a month, or add transactions as you go",
    "Review suggested categories and possible duplicates",
    "See your spending together in one calm dashboard"
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-sm border-b border-base-300/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-base-content">Celengan</span>
          </div>
          <Link href="/dashboard">
            <button className="btn btn-ghost btn-sm">
              Open App
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-semibold text-base-content leading-tight mb-6">
              Know where your money goes.
              <br />
              <span className="text-base-content/70">Together.</span>
            </h1>
            <p className="text-lg text-base-content/70 mb-10 max-w-xl mx-auto leading-relaxed">
              A calm, shared money tracker for couples. No budgets. No guilt.
              Just clarity on spending—whenever you want it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <button className="btn btn-primary btn-lg w-full sm:w-auto gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Subtle */}
      <section className="py-12 px-6 border-y border-base-300/30 bg-base-200/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-base-content/70">
            Built for couples who want to understand their finances without the stress
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-base-content mb-4">
              Money tracking that respects you
            </h2>
            <p className="text-base-content/70 max-w-lg mx-auto">
              We believe you don&apos;t need another app telling you what to do.
              You just need to see clearly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-base-content mb-2">{feature.title}</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-base-200/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-base-content mb-4">
              Simple by design
            </h2>
            <p className="text-base-content/70">
              Import once a month, or add as you go. Your choice.
            </p>
          </motion.div>

          <div className="space-y-4">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-4 bg-base-100 rounded-xl p-5 border border-base-300/50"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-base-content">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-base-content mb-4">
              What we don&apos;t do
            </h2>
            <p className="text-base-content/70 mb-10 max-w-lg mx-auto">
              No guilt. No gamification. No pressure to open the app every day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["No budgets", "No streaks", "No shame", "No auto-sync", "No notifications"].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full bg-base-200 text-base-content/70 text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-base-content mb-4">
              Ready to see where your money goes?
            </h2>
            <p className="text-base-content/70 mb-8">
              Start tracking together. Takes about 5 minutes to import your first month.
            </p>
            <Link href="/dashboard">
              <button className="btn btn-primary btn-lg gap-2">
                Open Celengan
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-base-300/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <PiggyBank className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm text-base-content/70">Celengan</span>
          </div>
          <p className="text-sm text-base-content/70">
            A calm money tracker for couples
          </p>
        </div>
      </footer>
    </div>
  );
}
