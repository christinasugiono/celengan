"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function FloatingActionButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/dashboard/transactions/new")
  }

  return (
    <div className="fab">
      {/* Main FAB button */}
      <button
        onClick={handleClick}
        className="btn btn-lg btn-circle btn-secondary shadow-2xl transition-all duration-300 relative z-50"
        aria-label="New transaction"
      >
        <Plus className="size-6" />
      </button>
    </div>
  )
}
