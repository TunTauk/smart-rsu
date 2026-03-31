import { redirect } from "next/navigation"
import { Bell, Sparkles } from "lucide-react"
import { requireSession } from "@/lib/auth/session"
import { getUserForSession } from "@/lib/auth/users"

export default async function DashboardPage() {
  const session = await requireSession("STUDENT")
  const user = await getUserForSession(session.userId)

  if (!user?.student) {
    redirect("/")
  }

  return (
    <div className="flex h-full w-full flex-col font-sans bg-[#f9fafb]">
      
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 flex-row items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Dashboard</h1>
        
        <div className="flex items-center gap-3">
          {/* Semester Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#A89A6F]/10 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#A89A6F]" />
            <span className="text-[11px] font-semibold text-[#A89A6F]">Semester 1 / 2568</span>
          </div>

          <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] hover:bg-[#f5f5f5] transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content Scrollable Body */}
      <div className="flex w-full flex-col gap-4 overflow-y-auto p-6">
        
        {/* Stats Row */}
        <div className="flex w-full flex-col sm:flex-row gap-4">
          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#A89A6F]">72 / 132</span>
            <span className="text-xs text-[#737373] mt-1">Credits Earned</span>
          </div>
          
          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#00A6DD]">24</span>
            <span className="text-xs text-[#737373] mt-1">Subjects Completed</span>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#16A34A]">3.42</span>
            <span className="text-xs text-[#737373] mt-1">Cumulative GPA</span>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#DC0963]">2027</span>
            <span className="text-xs text-[#737373] mt-1">Est. Graduation</span>
          </div>
        </div>

        {/* Degree Progress */}
        <div className="flex w-full flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Degree Progress</h2>
            <span className="text-sm font-semibold text-[#00A6DD]">55% Complete</span>
          </div>

          {/* Main Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full bg-[#00A6DD]" style={{ width: '55%' }} />
          </div>

          {/* Sub Bars */}
          <div className="mt-2 flex flex-col gap-2">
            
            {/* Core Subjects */}
            <div className="flex items-center gap-3">
              <span className="w-28 text-xs text-[#737373]">Core Subjects</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div className="h-full rounded-full bg-[#A89A6F]" style={{ width: '68%' }} />
              </div>
              <span className="w-8 text-right text-[11px] text-[#737373]">68%</span>
            </div>

            {/* Electives */}
            <div className="flex items-center gap-3">
              <span className="w-28 text-xs text-[#737373]">Electives</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div className="h-full rounded-full bg-[#00A6DD]" style={{ width: '45%' }} />
              </div>
              <span className="w-8 text-right text-[11px] text-[#737373]">45%</span>
            </div>

            {/* Free Electives */}
            <div className="flex items-center gap-3">
              <span className="w-28 text-xs text-[#737373]">Free Electives</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div className="h-full rounded-full bg-[#DC0963]" style={{ width: '30%' }} />
              </div>
              <span className="w-8 text-right text-[11px] text-[#737373]">30%</span>
            </div>

          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex w-full flex-col lg:flex-row gap-4">
          
          {/* Table Card */}
          <div className="flex flex-1 flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Currently Enrolled</h2>
            
            <div className="flex flex-col w-full text-left">
              {/* Header */}
              <div className="flex gap-2 border-b border-[#e5e5e5] py-2 align-middle">
                <span className="w-[88px] text-[11px] font-medium tracking-wide text-[#737373]">CODE</span>
                <span className="flex-1 text-[11px] font-medium tracking-wide text-[#737373]">SUBJECT NAME</span>
                <span className="w-10 text-[11px] font-medium tracking-wide text-[#737373]">CR</span>
                <span className="w-32 text-[11px] font-medium tracking-wide text-[#737373]">SCHEDULE</span>
                <span className="w-[60px] text-[11px] font-medium tracking-wide text-[#737373]">STATUS</span>
              </div>
              
              {/* Row 1 */}
              <div className="flex gap-2 border-b border-[#f0f0f0] py-2.5 items-center">
                <span className="w-[88px] text-[13px] text-[#0a0a0a]">CS301</span>
                <span className="flex-1 text-[13px] text-[#0a0a0a] line-clamp-1">Software Engineering</span>
                <span className="w-10 text-[13px] text-[#737373]">3</span>
                <span className="w-32 text-xs text-[#737373]">Mon 9–12</span>
                <span className="w-[60px] text-xs font-medium text-[#16A34A]">Enrolled</span>
              </div>

              {/* Row 2 */}
              <div className="flex gap-2 border-b border-[#f0f0f0] py-2.5 items-center">
                <span className="w-[88px] text-[13px] text-[#0a0a0a]">MATH201</span>
                <span className="flex-1 text-[13px] text-[#0a0a0a] line-clamp-1">Calculus for Engineers</span>
                <span className="w-10 text-[13px] text-[#737373]">3</span>
                <span className="w-32 text-xs text-[#737373]">Tue 13–16</span>
                <span className="w-[60px] text-xs font-medium text-[#16A34A]">Enrolled</span>
              </div>

              {/* Row 3 */}
              <div className="flex gap-2 py-2.5 items-center border-b border-[#f0f0f0]">
                <span className="w-[88px] text-[13px] text-[#0a0a0a]">ENG102</span>
                <span className="flex-1 text-[13px] text-[#0a0a0a] line-clamp-1">Academic English</span>
                <span className="w-10 text-[13px] text-[#737373]">2</span>
                <span className="w-32 text-xs text-[#737373]">Wed 9–11</span>
                <span className="w-[60px] text-xs font-medium text-[#737373]">Pending</span>
              </div>
            </div>
          </div>

          {/* AI Banner */}
          <div className="flex w-full lg:w-[280px] flex-shrink-0 flex-col items-center justify-center gap-4 rounded-xl border border-[#00A6DD]/20 bg-[#00A6DD]/[0.05] p-6 text-center">
            <Sparkles className="h-9 w-9 text-[#00A6DD]" />
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[15px] font-bold text-[#0a0a0a] leading-tight">Plan Your Next Semester</h3>
              <p className="text-xs text-[#737373] leading-relaxed">Chat with the AI assistant to get personalized course recommendations</p>
            </div>
            
            <button className="inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 mt-1">
              Start Planning &rarr;
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
