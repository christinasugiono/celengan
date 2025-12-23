"use client"

import { useState, useRef, useEffect, ReactNode } from "react"

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  position?: "top" | "bottom" | "left" | "right"
  align?: "left" | "center" | "right"
  width?: "auto" | "sm" | "md" | "lg" | "xl" | string
  onOpen?: () => void
  onClose?: () => void
  disabled?: boolean
}

const widthClasses = {
  auto: "w-auto",
  sm: "w-48",
  md: "w-64",
  lg: "w-80",
  xl: "w-96",
}

const positionClasses = {
  top: {
    left: "bottom-full left-0 mb-2",
    center: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "bottom-full right-0 mb-2",
  },
  bottom: {
    left: "top-full left-0 mt-2",
    center: "top-full left-1/2 -translate-x-1/2 mt-2",
    right: "top-full right-0 mt-2",
  },
  left: {
    left: "right-full top-0 mr-2",
    center: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "right-full bottom-0 mr-2",
  },
  right: {
    left: "left-full top-0 ml-2",
    center: "left-full top-1/2 -translate-y-1/2 ml-2",
    right: "left-full bottom-0 ml-2",
  },
}

export default function Dropdown({
  trigger,
  children,
  position = "bottom",
  align = "center",
  width = "md",
  onOpen,
  onClose,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    if (disabled) return
    const newState = !isOpen
    setIsOpen(newState)
    if (newState) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const widthClass = typeof width === "string" && widthClasses[width as keyof typeof widthClasses]
    ? widthClasses[width as keyof typeof widthClasses]
    : typeof width === "string"
    ? `w-[${width}]`
    : "w-auto"

  const positionClass = positionClasses[position][align]

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleToggle} className={disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute ${positionClass} ${widthClass} max-w-[calc(100vw-2rem)] bg-base-200 rounded-lg shadow-lg border border-base-300 z-50`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
