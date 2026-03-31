"use client"

import {
  Hexagon,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarRange,
  LogOut,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/instructors", label: "Instructors", icon: Users },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/course-plan", label: "Course Plan", icon: CalendarRange },
]

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen w-full bg-[#f9fafb] font-sans">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 flex h-screen w-[256px] flex-col gap-2 border-r border-[#e5e5e5] bg-white p-2">
        {/* Brand */}
        <div className="flex items-center gap-2 rounded-lg bg-[#A89A6F]/10 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A89A6F]">
            <Hexagon className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#0a0a0a]">Smart RSU</span>
            <span className="flex items-center gap-1 text-[10px] text-[#A89A6F] font-medium">
              <Shield className="h-2.5 w-2.5" />
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[#00A6DD]/10 text-[#00A6DD] font-semibold"
                    : "text-[#0a0a0a] font-medium hover:bg-[#f5f5f5]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-[#00A6DD]" : "text-[#737373]"}`}
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-2 border-t border-[#e5e5e5] pt-2 px-1 pb-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A89A6F] text-[13px] font-bold text-white">
            A
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-[13px] font-medium text-[#0a0a0a]">Admin</span>
            <span className="truncate text-[11px] text-[#737373]">admin@rsu.ac.th</span>
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

      {/* Main */}
      <main className="ml-[256px] flex flex-1 flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
