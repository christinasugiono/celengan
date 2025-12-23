"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Home, List, Wallet, User, LogOut, Sun, Moon } from "lucide-react"
import Dropdown from "./Dropdown"

export default function Dock() {
  const pathname = usePathname()
  const router = useRouter()

  // Get initial theme from localStorage
  const getInitialTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "dark"
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    return savedTheme || "dark"
  }

  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme())

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
    },
    {
      href: "/transactions",
      icon: List,
    },
    {
      href: "/budgets",
      icon: Wallet,
    },
  ]

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      })
      if (response.ok) {
        router.push("/sign-in")
        router.refresh()
      }
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    const root = document.documentElement
    root.setAttribute("data-theme", newTheme === "dark" ? "celengan-dark" : "celengan-light")
    localStorage.setItem("theme", newTheme)
  }

  return (
    <div className="dock dock-md">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={ isActive ? "dock-active" : "" }
          >
            <Icon className="size-[1.2em]" />
          </Link>
        )
      })}
      <Dropdown
        trigger={
          <button
            className={pathname === "/profile" ? "dock-active" : ""}
          >
            <User className="size-[1.2em]" />
          </button>
        }
        position="top"
        align="center"
        width="md"
      >
        <div className="p-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-300 transition-colors text-left"
          >
            {theme === "light" ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-300 transition-colors text-left text-error"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </Dropdown>
    </div>
  )
}
