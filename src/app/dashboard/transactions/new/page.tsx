"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, FileText, Camera, PenLine } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardNavbar from "@/app/components/DashboardNavbar"
import Dock from "@/app/components/Dock"
import AddMethodCard from "@/app/components/AddMethodCard"

interface Category {
  id: string
  name: string
  kind: "income" | "expense"
}

interface Group {
  id: string
  name: string
  defaultCurrency: string
}

type AddMode = "select" | "manual" | "screenshot" | "import"

function NewTransactionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<AddMode>("select")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [direction, setDirection] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState<string>("")
  const [occurredAt, setOccurredAt] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [merchant, setMerchant] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [owner, setOwner] = useState<"mine" | "shared" | "other">("mine")

  // Check URL params for direct mode
  useEffect(() => {
    const source = searchParams.get("source")
    if (source === "camera" || source === "gallery") {
      setMode("screenshot")
    } else if (source === "manual") {
      setMode("manual")
    }
  }, [searchParams])

  // Load group and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user's groups
        const groupsResponse = await fetch("/api/groups")
        if (!groupsResponse.ok) {
          throw new Error("Failed to load groups")
        }
        const groupsData = await groupsResponse.json()
        if (groupsData.groups.length === 0) {
          router.push("/onboarding")
          return
        }

        // Use active group if available, otherwise fall back to first group
        const activeGroup =
          groupsData.groups.find((g: Group & { isActive?: boolean }) => g.isActive) ||
          groupsData.groups[0]
        setGroup(activeGroup)

        // Fetch categories for this group
        const categoriesResponse = await fetch(
          `/api/categories?groupId=${activeGroup.id}`
        )
        if (!categoriesResponse.ok) {
          throw new Error("Failed to load categories")
        }
        const categoriesData = await categoriesResponse.json()

        if (categoriesData.categories.length === 0) {
          // Seed categories if none exist
          const seedResponse = await fetch("/api/categories/seed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: activeGroup.id }),
          })
          if (seedResponse.ok) {
            // Reload categories
            const reloadResponse = await fetch(
              `/api/categories?groupId=${activeGroup.id}`
            )
            if (reloadResponse.ok) {
              const reloadData = await reloadResponse.json()
              setCategories(reloadData.categories)
            }
          }
        } else {
          setCategories(categoriesData.categories)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Filter categories by direction
  const filteredCategories = categories.filter(
    (cat) => cat.kind === direction
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!group) {
      setError("Group not loaded")
      setIsSubmitting(false)
      return
    }

    // Validate amount
    const amountValue = parseFloat(amount.replace(/[^\d.-]/g, ""))
    if (!amountValue || amountValue <= 0) {
      setError("Please enter a valid amount")
      setIsSubmitting(false)
      return
    }

    // Convert to cents
    const amountCents = Math.round(amountValue * 100)

    // Combine merchant and description
    const fullDescription = merchant.trim()
      ? description.trim()
        ? `${merchant.trim()} - ${description.trim()}`
        : merchant.trim()
      : description.trim() || null

    try {
      const response = await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          occurredAt,
          amountCents,
          currency: group.defaultCurrency,
          direction,
          description: fullDescription,
          note: note.trim() || null,
          categoryId: categoryId || null,
          owner,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create transaction")
      }

      // Success - redirect to transactions page
      router.push("/transactions")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")
    if (!digits) return ""
    // Format as currency (IDR)
    const num = parseInt(digits, 10)
    return new Intl.NumberFormat("id-ID").format(num)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-100 text-base-content pb-20 sm:pb-16" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <DashboardNavbar activeGroupName="Loading..." />
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </div>
        <Dock />
      </main>
    )
  }

  if (!group) {
    return (
      <main className="min-h-screen bg-base-100 text-base-content pb-20 sm:pb-16" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <DashboardNavbar activeGroupName="Error" />
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="alert alert-error">
            <span>Failed to load group data</span>
          </div>
        </div>
        <Dock />
      </main>
    )
  }

  const renderContent = () => {
    switch (mode) {
      case "manual":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode("select")}
                className="btn btn-ghost btn-sm btn-square"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-base-content">
                Manual Entry
              </h2>
            </div>
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Direction Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Type</span>
                </label>
                <div className="join w-full">
                  <button
                    type="button"
                    onClick={() => setDirection("expense")}
                    className={`join-item btn flex-1 ${
                      direction === "expense"
                        ? "btn-primary"
                        : "btn-outline text-base-content hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("income")}
                    className={`join-item btn flex-1 ${
                      direction === "income"
                        ? "btn-primary"
                        : "btn-outline text-base-content hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Amount</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/75 z-10">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="input input-bordered w-full pl-10 text-lg font-semibold text-base-content"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                  />
                </div>
              </div>

              {/* Merchant */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Merchant / Person</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Superindo, Grab, Mom"
                  className="input input-bordered w-full text-base-content"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description (optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  className="input input-bordered w-full text-base-content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                />
              </div>

              {/* Category and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-base-content"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full text-base-content"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Owner Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Who paid?</span>
                </label>
                <div className="flex gap-2">
                  {(["mine", "other", "shared"] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOwner(o)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
                        owner === o
                          ? o === "mine"
                            ? "bg-primary/20 text-primary border-primary"
                            : o === "other"
                            ? "bg-secondary/20 text-secondary border-secondary"
                            : "bg-accent/20 text-accent border-accent"
                          : "bg-base-200 text-base-content/70 border-transparent hover:bg-base-300"
                      }`}
                    >
                      {o === "mine" ? "You" : o === "other" ? "Partner" : "Shared"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Note (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-base-content"
                  placeholder="Additional notes..."
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("select")}
                  className="btn btn-outline flex-1 text-base-content hover:bg-base-200 hover:text-base-content"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Transaction
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        )

      case "screenshot":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode("select")}
                className="btn btn-ghost btn-sm btn-square"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-base-content">
                Add from Screenshot
              </h2>
            </div>
            <div className="card bg-base-200/60 border border-base-300/50 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-base-content">
                  Upload a receipt or screenshot
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  We&apos;ll extract the amount, merchant, and date automatically
                </p>
              </div>
              <button className="btn btn-outline w-full" disabled>
                Choose File
              </button>
              <p className="text-xs text-base-content/70">
                Requires backend connection. Coming soon!
              </p>
            </div>
          </div>
        )

      case "import":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode("select")}
                className="btn btn-ghost btn-sm btn-square"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-base-content">
                Import Bank Statement
              </h2>
            </div>
            <div className="card bg-base-200/60 border border-base-300/50 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-base-content">
                  Upload a bank statement
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Supports CSV and PDF formats. We&apos;ll parse transactions and
                  check for duplicates.
                </p>
              </div>
              <button className="btn btn-outline w-full" disabled>
                Upload Statement
              </button>
              <p className="text-xs text-base-content/70">
                Requires backend connection. Coming soon!
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-base-content">
                Add Transaction
              </h2>
              <p className="text-base-content/70 mt-0.5">
                Choose how you want to add
              </p>
            </div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AddMethodCard
                  icon={<PenLine className="w-5 h-5" />}
                  title="Manual Entry"
                  description="Type in the details yourself"
                  onClick={() => setMode("manual")}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <AddMethodCard
                  icon={<Camera className="w-5 h-5" />}
                  title="From Screenshot"
                  description="Upload a receipt or transfer proof"
                  onClick={() => setMode("screenshot")}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AddMethodCard
                  icon={<FileText className="w-5 h-5" />}
                  title="Import Bank Statement"
                  description="Upload CSV or PDF for bulk import"
                  onClick={() => setMode("import")}
                />
              </motion.div>
            </div>

            <p className="text-sm text-base-content/70 text-center">
              All entries are reviewed before saving. Nothing is auto-saved.
            </p>
          </div>
        )
    }
  }

  return (
    <main
      className="min-h-screen bg-base-100 text-base-content pb-20 sm:pb-16"
      style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
    >
      <DashboardNavbar
        activeGroupName={group?.name || "Loading..."}
        activeGroupId={group?.id}
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 sm:py-8">
        {mode === "select" && (
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost btn-sm gap-2 mb-4 text-base-content hover:bg-base-200 hover:text-base-content"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "select" ? -8 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "select" ? 8 : -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dock />
    </main>
  )
}

export default function NewTransactionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-base-100 text-base-content pb-20 sm:pb-16" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
          <DashboardNavbar activeGroupName="Loading..." />
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          </div>
          <Dock />
        </main>
      }
    >
      <NewTransactionContent />
    </Suspense>
  )
}
