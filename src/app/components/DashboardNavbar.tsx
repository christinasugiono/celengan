"use client"

import { useState, useRef, useEffect } from "react"
import { Users } from "lucide-react"
import Logo from "./Logo"

interface DashboardNavbarProps {
  activeGroupName: string
  activeGroupId?: string
}

interface GroupMember {
  id: string
  profileId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: "owner" | "member"
  joinedAt: Date
}

export default function DashboardNavbar({ activeGroupName, activeGroupId }: DashboardNavbarProps) {
  const [showMembersMenu, setShowMembersMenu] = useState(false)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get first letter of group name for avatar
  const groupInitial = activeGroupName.charAt(0).toUpperCase()

  const handleToggleMembersMenu = async () => {
    if (!activeGroupId) return

    const newShowState = !showMembersMenu
    setShowMembersMenu(newShowState)

    // Fetch members when opening the menu
    if (newShowState && members.length === 0 && !loadingMembers) {
      setLoadingMembers(true)
      try {
        const res = await fetch(`/api/groups/${activeGroupId}/members`)
        const data = await res.json()
        if (data.members) {
          setMembers(data.members)
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
      } finally {
        setLoadingMembers(false)
      }
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMembersMenu(false)
      }
    }

    if (showMembersMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMembersMenu])

  const getMemberInitial = (member: GroupMember) => {
    if (member.fullName) {
      return member.fullName.charAt(0).toUpperCase()
    }
    return member.email.charAt(0).toUpperCase()
  }

  const getMemberDisplayName = (member: GroupMember) => {
    return member.fullName || member.email
  }

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50 sticky top-0 z-50 px-2 sm:px-4">
      <div className="navbar-start flex-1 min-w-0">
        <Logo size="sm" />
      </div>
      <div className="navbar-center hidden sm:flex">
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleToggleMembersMenu}
            disabled={!activeGroupId}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-base-200 border border-base-300/50 hover:bg-base-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs sm:text-sm font-semibold text-primary shrink-0">
              {groupInitial}
            </div>
            <span className="text-xs sm:text-sm font-medium text-base-content hidden md:inline truncate max-w-[200px]">
              {activeGroupName}
            </span>
          </button>
          {showMembersMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-base-200 rounded-lg shadow-lg border border-base-300 p-3 z-50">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
                <Users className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Members</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-sm text-base-content/60 py-2">No members found</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-base-300 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={getMemberDisplayName(member)}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            getMemberInitial(member)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-base-content truncate">
                            {getMemberDisplayName(member)}
                          </p>
                          <p className="text-xs text-base-content/60 truncate">
                            {member.role === "owner" ? "Owner" : "Member"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
