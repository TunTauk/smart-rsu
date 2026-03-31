"use client"

import { Hexagon, LayoutDashboard, MessageCircle, BookOpen, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"

type DashboardLayoutClientProps = {
  children: React.ReactNode
  studentName: string
  studentId: string
}

export default function DashboardLayoutClient({
  children,
  studentName,
  studentId,
}: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const avatarLetter = studentName.trim().charAt(0).toUpperCase() || "S"

  return (
    <div className="flex min-h-screen w-full font-sans bg-[#f9fafb]">
      <aside className="fixed top-0 left-0 z-40 flex h-screen w-[256px] flex-col gap-2 border-r border-[#e5e5e5] bg-white p-2">
        <div className="flex items-center gap-2 rounded-lg bg-[#A89A6F]/10 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A89A6F]">
            <Hexagon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#0a0a0a]">Smart RSU</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 rounded-md px-2 py-2 transition-colors ${
              pathname === "/dashboard"
                ? "bg-[#00A6DD]/10"
                : "hover:bg-[#f5f5f5]"
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 ${pathname === "/dashboard" ? "text-[#00A6DD]" : "text-[#737373]"}`} />
            <span className={`text-sm ${pathname === "/dashboard" ? "font-semibold text-[#00A6DD]" : "font-medium text-[#0a0a0a]"}`}>
              Home
            </span>
          </Link>

          <Link
            href="/dashboard/chat"
            className={`flex items-center gap-2 rounded-md px-2 py-2 transition-colors ${
              pathname === "/dashboard/chat"
                ? "bg-[#00A6DD]/10"
                : "hover:bg-[#f5f5f5]"
            }`}
          >
            <MessageCircle className={`h-4 w-4 ${pathname === "/dashboard/chat" ? "text-[#00A6DD]" : "text-[#737373]"}`} />
            <span className={`text-sm ${pathname === "/dashboard/chat" ? "font-semibold text-[#00A6DD]" : "font-medium text-[#0a0a0a]"}`}>
              Chat Assistant
            </span>
          </Link>

          <Link
            href="/dashboard/courses"
            className={`flex items-center gap-2 rounded-md px-2 py-2 transition-colors ${
              pathname === "/dashboard/courses"
                ? "bg-[#00A6DD]/10"
                : "hover:bg-[#f5f5f5]"
            }`}
          >
            <BookOpen className={`h-4 w-4 ${pathname === "/dashboard/courses" ? "text-[#00A6DD]" : "text-[#737373]"}`} />
            <span className={`text-sm ${pathname === "/dashboard/courses" ? "font-semibold text-[#00A6DD]" : "font-medium text-[#0a0a0a]"}`}>
              Course Recommendation
            </span>
          </Link>

<Link
            href="/dashboard/profile"
            className={`flex items-center gap-2 rounded-md px-2 py-2 transition-colors ${
              pathname === "/dashboard/profile"
                ? "bg-[#00A6DD]/10"
                : "hover:bg-[#f5f5f5]"
            }`}
          >
            <User className={`h-4 w-4 ${pathname === "/dashboard/profile" ? "text-[#00A6DD]" : "text-[#737373]"}`} />
            <span className={`text-sm ${pathname === "/dashboard/profile" ? "font-semibold text-[#00A6DD]" : "font-medium text-[#0a0a0a]"}`}>
              Profile
            </span>
          </Link>
        </nav>

        <div className="mt-auto flex items-center gap-2 border-t border-[#e5e5e5] pt-2 px-1 pb-1">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#00A6DD] text-[13px] font-bold text-white">
            {avatarLetter}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="truncate text-[13px] font-medium text-[#0a0a0a]">{studentName}</span>
            <span className="truncate text-[11px] text-[#737373]">Student ID: {studentId}</span>
          </div>
          <form action={logout}>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#f5f5f5]"
              type="submit"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>

      <main className="ml-[256px] flex flex-1 flex-col overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  )
}
