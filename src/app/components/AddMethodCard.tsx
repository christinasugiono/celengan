"use client"

import { ReactNode } from "react"

interface AddMethodCardProps {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}

export default function AddMethodCard({
  icon,
  title,
  description,
  onClick,
}: AddMethodCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left card bg-base-200/60 border border-base-300/50 hover:border-primary/30 transition-all hover:bg-base-200"
    >
      <div className="card-body p-5">
        <div className="flex gap-4 items-start">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <div className="text-primary">{icon}</div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-base-content mb-1">
              {title}
            </h3>
            <p className="text-sm text-base-content/70 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}
