import {
  Users,
  BookOpen,
  CalendarRange,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  BookMarked,
  Layout,
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

async function getStats() {
  const [instructors, subjects, schedules, students] = await Promise.all([
    prisma.instructors.count(),
    prisma.subjects.count(),
    prisma.semester_schedules.count(),
    prisma.students.count(),
  ])
  return { instructors, subjects, schedules, students }
}

async function getRecentInstructors() {
  return prisma.instructors.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: { user: { select: { email: true } } },
  })
}

async function getRecentSubjects() {
  return prisma.subjects.findMany({
    take: 5,
    orderBy: { id: "desc" },
    select: { id: true, code: true, name: true, type: true, credit: true },
  })
}

export default async function AdminOverviewPage() {
  const [stats, recentInstructors, recentSubjects] = await Promise.all([
    getStats(),
    getRecentInstructors(),
    getRecentSubjects(),
  ])

  const statCards = [
    {
      label: "Instructors",
      value: stats.instructors,
      icon: Users,
      href: "/admin/instructors",
      color: "text-[#00A6DD]",
      bg: "bg-[#00A6DD]/10",
    },
    {
      label: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
      href: "/admin/subjects",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Course Plans",
      value: stats.schedules,
      icon: CalendarRange,
      href: "/admin/course-plan",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Students",
      value: stats.students,
      icon: GraduationCap,
      href: "#",
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ]

  const quickLinks = [
    { label: "Add Instructor", href: "/admin/instructors", icon: Users, desc: "Create a new instructor account" },
    { label: "Create Subject", href: "/admin/subjects", icon: BookMarked, desc: "Add a subject to the catalog" },
    { label: "Upload Course Plan", href: "/admin/course-plan", icon: Layout, desc: "Upload or enter a semester schedule" },
  ]

  return (
    <div className="flex flex-col gap-8 overflow-y-auto p-8">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Overview</h1>
        <p className="text-sm text-[#737373]">
          A snapshot of the Smart RSU system at a glance.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-4 rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all hover:border-[#d4d4d4] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-[#d4d4d4]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl font-bold text-[#0a0a0a]">{value}</span>
              <span className="text-sm text-[#737373]">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Quick actions ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[#0a0a0a]">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-sm transition-all hover:border-[#00A6DD]/40 hover:bg-[#00A6DD]/[0.02] hover:shadow-md group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00A6DD]/10">
                <Icon className="h-4 w-4 text-[#00A6DD]" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold text-[#0a0a0a]">{label}</span>
                <span className="text-xs text-[#737373]">{desc}</span>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#d4d4d4] transition-transform group-hover:translate-x-0.5 group-hover:text-[#00A6DD]" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent data ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Recent instructors */}
        <div className="flex flex-col rounded-lg border border-[#e5e5e5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#00A6DD]" />
              <span className="text-sm font-semibold text-[#0a0a0a]">Recent Instructors</span>
            </div>
            <Link href="/admin/instructors" className="flex items-center gap-1 text-xs text-[#00A6DD] hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-[#f5f5f5]">
            {recentInstructors.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#a3a3a3]">No instructors yet.</p>
            ) : (
              recentInstructors.map((i) => {
                const initials = i.name
                  .split(" ").slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? "").join("")
                return (
                  <div key={i.id} className="flex items-center gap-3 px-5 py-3">
                    {i.profile_url ? (
                      <img src={i.profile_url} alt={i.name} className="h-8 w-8 rounded-full object-cover border border-[#e5e5e5]" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00A6DD] to-[#1565C0] text-xs font-bold text-white">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-[13px] font-medium text-[#0a0a0a]">{i.name}</span>
                      <span className="truncate text-xs text-[#737373]">{i.user.email}</span>
                    </div>
                    {i.department && (
                      <span className="shrink-0 rounded-full bg-[#00A6DD]/10 px-2 py-0.5 text-[11px] font-medium text-[#00A6DD]">
                        {i.department}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent subjects */}
        <div className="flex flex-col rounded-lg border border-[#e5e5e5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-[#0a0a0a]">Recent Subjects</span>
            </div>
            <Link href="/admin/subjects" className="flex items-center gap-1 text-xs text-[#00A6DD] hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-[#f5f5f5]">
            {recentSubjects.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#a3a3a3]">No subjects yet.</p>
            ) : (
              recentSubjects.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="shrink-0 rounded bg-purple-100 px-2 py-0.5 text-[12px] font-bold text-purple-700">
                    {s.code}
                  </span>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-[13px] font-medium text-[#0a0a0a]">{s.name}</span>
                    <span className="text-xs text-[#737373]">{s.type}</span>
                  </div>
                  <span className="shrink-0 text-xs text-[#a3a3a3]">{s.credit} cr</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
