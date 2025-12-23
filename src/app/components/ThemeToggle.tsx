"use client"

import { useEffect, useState, useCallback } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const applyTheme = useCallback((newTheme: "light" | "dark") => {
    const root = document.documentElement
    root.setAttribute("data-theme", newTheme === "dark" ? "celengan-dark" : "celengan-light")
    localStorage.setItem("theme", newTheme)
  }, [])

  // Get initial theme from localStorage or default to dark
  const getInitialTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "dark"
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    return savedTheme || "dark"
  }

  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Apply theme on mount and mark as mounted
    const initialTheme = getInitialTheme()
    applyTheme(initialTheme)
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setMounted(true)
    }, 0)
  }, [applyTheme])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="btn btn-ghost btn-sm btn-square">
        <span className="loading loading-spinner loading-sm"></span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-sm btn-square"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  )
}
