"use client"

import { PiggyBank } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md" }: LogoProps) {
  const containerSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const textSizes = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${containerSizes[size]} rounded-full bg-primary/10 flex items-center justify-center`}>
        <PiggyBank className={`${iconSizes[size]} text-primary`} />
      </div>
      <span className={`${textSizes[size]} font-semibold text-base-content`}>
        Celengan
      </span>
    </div>
  )
}
