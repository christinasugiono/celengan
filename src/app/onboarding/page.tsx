"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Plus, X, ArrowRight, ArrowLeft, PiggyBank } from "lucide-react"

interface BudgetItem {
  id: string
  name: string
  limitRupiah: number | ""
  kind: "expense" | "income" | "transfer"
  isDefault: boolean
}

function BudgetItemRow({
  item,
  onChangeName,
  onChangeLimit,
  onRemove,
}: {
  item: BudgetItem
  onChangeName: (value: string) => void
  onChangeLimit: (value: number | "") => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-3 items-start p-4 rounded-xl bg-base-100 border border-base-300/70 shadow-sm">
      <div className="flex-1 space-y-2">
        <input
          type="text"
          placeholder="Category name"
          className="input input-bordered input-sm w-full text-base-content"
          value={item.name}
          onChange={(e) => onChangeName(e.target.value)}
          disabled={item.isDefault}
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-base-content/75">
            Rp
          </span>
          <input
            type="number"
            placeholder="0"
            className="input input-bordered input-sm w-full pl-10 text-base-content"
            value={item.limitRupiah}
            onChange={(e) =>
              onChangeLimit(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="btn btn-ghost btn-sm btn-square"
        aria-label="Remove category"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

const DEFAULT_CATEGORIES: Omit<BudgetItem, "id">[] = [
  { name: "Rent", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Utilities: Electricity", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Utilities: Water", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Utilities: Gas", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Food (eating out)", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Groceries", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Shopping", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Hobbies", limitRupiah: "", kind: "expense", isDefault: true },
  { name: "Travel", limitRupiah: "", kind: "expense", isDefault: true },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<"group" | "income" | "budget">("group")
  const [groupName, setGroupName] = useState<string>("Personal")
  const [monthlyIncome, setMonthlyIncome] = useState<string>("")
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(
    DEFAULT_CATEGORIES.map((cat, idx) => ({
      ...cat,
      id: `default-${idx}`,
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  // Check if user already has groups - if so, redirect to dashboard
  useEffect(() => {
    const checkGroups = async () => {
      try {
        const response = await fetch("/api/onboarding/check")
        if (response.ok) {
          const data = await response.json()
          if (data.hasGroups) {
            router.push("/app")
            return
          }
        }
      } catch (err) {
        console.error("Error checking groups:", err)
      } finally {
        setIsChecking(false)
      }
    }

    checkGroups()
  }, [router])

  const handleAddCategory = () => {
    setBudgetItems([
      ...budgetItems,
      {
        id: `custom-${Date.now()}`,
        name: "",
        limitRupiah: "",
        kind: "expense",
        isDefault: false,
      },
    ])
  }

  const handleRemoveCategory = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id))
  }

  const handleCategoryChange = (
    id: string,
    field: "name" | "limitRupiah",
    value: string | number
  ) => {
    setBudgetItems(
      budgetItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleContinueFromGroup = () => {
    if (!groupName.trim()) {
      setError("Please enter a group name.")
      return
    }
    setError(null)
    setStep("income")
  }

  const handleContinueFromIncome = () => {
    // Allow skipping income
    setStep("budget")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Filter out empty categories and validate
      const validItems = budgetItems.filter(
        (item) => item.name.trim() && item.limitRupiah !== ""
      )

      if (validItems.length === 0) {
        setError("Please add at least one budget category with a limit.")
        setIsSubmitting(false)
        return
      }

      // Validate all limits are numbers
      for (const item of validItems) {
        if (typeof item.limitRupiah !== "number" || item.limitRupiah <= 0) {
          setError("All budget limits must be positive numbers.")
          setIsSubmitting(false)
          return
        }
      }

      const payload = {
        groupName: groupName.trim(),
        monthlyIncomeRupiah:
          monthlyIncome && monthlyIncome.trim()
            ? parseFloat(monthlyIncome)
            : null,
        budgetItems: validItems.map((item) => ({
          name: item.name.trim(),
          kind: item.kind,
          limitRupiah: item.limitRupiah,
        })),
      }

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to complete onboarding")
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking if user has groups
  if (isChecking) {
    return (
      <main className="min-h-screen bg-base-100 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-base-100 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 md:py-16 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-base-content">
              Celengan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-base-content px-2">
            Welcome! Let&apos;s get you set up
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-base-content/85 max-w-xl mx-auto px-2">
            Just a few quick steps to make your money make sense.
          </p>
        </div>

        <div className="card bg-base-200/80 backdrop-blur-md border border-base-300/50 shadow-xl">
          <div className="card-body p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div
                className={`h-2 w-16 rounded-full transition-colors ${
                  step === "group" ? "bg-primary" : step === "income" || step === "budget" ? "bg-primary/50" : "bg-base-300"
                }`}
              />
              <div
                className={`h-2 w-16 rounded-full transition-colors ${
                  step === "income" ? "bg-primary" : step === "budget" ? "bg-primary/50" : "bg-base-300"
                }`}
              />
              <div
                className={`h-2 w-16 rounded-full transition-colors ${
                  step === "budget" ? "bg-primary" : "bg-base-300"
                }`}
              />
            </div>

            {step === "group" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2">
                    What should we call this?
                  </h2>
                  <p className="text-base-content/80">
                    Groups help you keep different parts of your finances separate. You can always add more later.
                  </p>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Group name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Personal"
                    className="input input-bordered w-full text-base-content"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2 text-sm text-base-content/80">
                  <p>• Use groups to keep different parts of your life separate.</p>
                  <p>
                    • Like: Personal, Business, Family, Vacation Fund
                  </p>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleContinueFromGroup}
                  className="btn btn-primary w-full gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === "income" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2">
                    How much do you make each month?
                  </h2>
                  <p className="text-base-content/80">
                    Don&apos;t worry, you can change this anytime.
                  </p>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Monthly income</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/75">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="15000000"
                      className="input input-bordered w-full pl-12 text-base-content"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm text-base-content/80">
                  <p>• You can always change this later.</p>
                  <p>
                    • If your income varies, no problem — just skip this and add
                    income as you go.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleContinueFromIncome}
                    className="btn btn-ghost flex-1 text-base-content hover:bg-base-200 hover:text-base-content"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleContinueFromIncome}
                    className="btn btn-primary flex-1 gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === "budget" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2">
                    How much do you want to spend?
                  </h2>
                  <p className="text-base-content/80">
                    Set limits for each category. Feel free to edit or remove anything you don&apos;t need.
                  </p>
                </div>

                <div className="space-y-3 max-h-[50vh] sm:max-h-[400px] overflow-y-auto -mx-2 px-2">
                  {budgetItems.map((item) => (
                    <BudgetItemRow
                      key={item.id}
                      item={item}
                      onChangeName={(value) => handleCategoryChange(item.id, "name", value)}
                      onChangeLimit={(value) => handleCategoryChange(item.id, "limitRupiah", value)}
                      onRemove={() => handleRemoveCategory(item.id)}
                    />
                  ))}
                </div>

                <button
                  onClick={handleAddCategory}
                  className="btn btn-outline btn-sm w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add category
                </button>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("income")}
                    className="btn btn-ghost flex-1 gap-2 text-base-content hover:bg-base-200 hover:text-base-content"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary flex-1 gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Setting things up...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Let&apos;s go!
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
