import { Sparkles, TriangleAlert, CircleCheck, SlidersHorizontal, CalendarCheck } from "lucide-react"

export default function CoursesPage() {
  return (
    <div className="flex h-screen w-full bg-[#f9fafb]">
      
      {/* Left Pane: AI Recommendations (400px) */}
      <aside className="flex w-[400px] shrink-0 flex-col border-r border-[#e5e5e5] bg-[#f9fafb]">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-start gap-2 border-b border-[#e5e5e5] bg-white px-5">
          <Sparkles className="h-[18px] w-[18px] text-[#00A6DD]" />
          <h2 className="text-sm font-semibold text-[#0a0a0a]">AI Recommendations</h2>
        </header>

        {/* AI Chat Stream */}
        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 content-start">
          
          {/* AI Message 1 */}
          <div className="flex w-full gap-2 relative">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1 text-white">
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="rounded-[0_12px_12px_12px] border border-[#e5e5e5] bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[13px] text-[#0a0a0a]">Based on your preferences, I found 5 great courses + 1 backup option. Check them out on the right!</p>
            </div>
          </div>

          {/* User Message 1 */}
          <div className="flex w-full justify-end">
            <div className="max-w-[85%] rounded-[12px_12px_0_12px] bg-[#00A6DD] px-3 py-2.5 shadow-sm">
              <p className="text-[13px] text-white">Looks good, let me review!</p>
            </div>
          </div>

          {/* AI Message 2: Warning */}
          <div className="flex w-full gap-2 relative">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1 text-white">
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="flex flex-col gap-1.5 rounded-[0_12px_12px_12px] border border-[#e5e5e5] bg-white p-2.5 shadow-sm flex-1">
              {/* Conflict Header */}
              <div className="flex items-center gap-1.5 self-start rounded-md border border-[#DC0963] bg-[#DC0963]/10 px-2.5 py-1.5">
                <TriangleAlert className="h-3 w-3 text-[#DC0963]" />
                <span className="text-[11px] font-semibold text-[#DC0963]">Schedule Conflict Detected</span>
              </div>
              <p className="text-[13px] text-[#0a0a0a] leading-relaxed">
                CS301 &amp; MATH201 both meet Tue 9–11am. Should I find an alternative section?
              </p>
            </div>
          </div>

          {/* User Message 2 */}
          <div className="flex w-full justify-end">
            <div className="max-w-[85%] rounded-[12px_12px_0_12px] bg-[#00A6DD] px-3 py-2.5 shadow-sm">
              <p className="text-[13px] text-white">Yes, please resolve it!</p>
            </div>
          </div>

          {/* AI Message 3: Resolution */}
          <div className="flex w-full gap-2 relative">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1 text-white">
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="flex flex-col gap-1.5 rounded-[0_12px_12px_12px] border border-[#e5e5e5] bg-white p-2.5 shadow-sm flex-1">
              {/* Resolved Header */}
              <div className="flex items-center gap-1.5 self-start rounded-md border border-[#00A6DD] bg-[#00A6DD]/10 px-2.5 py-1.5">
                <CircleCheck className="h-3 w-3 text-[#00A6DD]" />
                <span className="text-[11px] font-semibold text-[#00A6DD]">Conflict Resolved</span>
              </div>
              <p className="text-[13px] text-[#0a0a0a] leading-relaxed">
                Done! MATH201 moved to Thu 9–11am. Review your updated schedule on the right.
              </p>
            </div>
          </div>

        </div>
      </aside>

      {/* Right Pane: Course Recommendations & Schedule View */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
          <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Course Recommendations</h2>
          <button className="flex items-center gap-2 text-[13px] text-[#737373] hover:text-[#0a0a0a] transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </header>

        {/* Tabs Row */}
        <div className="flex shrink-0 border-b border-[#e5e5e5] bg-white px-6 pt-2">
          <div className="flex items-center gap-6">
            <button className="border-b-2 border-[#00A6DD] pb-3 text-[13px] font-semibold text-[#00A6DD]">
              Recommended (5)
            </button>
            <button className="border-b-2 border-transparent pb-3 text-[13px] text-[#737373] hover:text-[#0a0a0a] transition-colors">
              All Available
            </button>
          </div>
        </div>

        {/* Main Interface Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          
          {/* Data Table */}
          <div className="flex w-full flex-col px-6">
            {/* Headers */}
            <div className="flex border-b border-[#e5e5e5] py-2 pt-4 items-center">
              <span className="w-[88px] text-[11px] font-medium tracking-wide text-[#737373]">CODE</span>
              <span className="flex-1 text-[11px] font-medium tracking-wide text-[#737373]">SUBJECT NAME</span>
              <span className="w-10 text-[11px] font-medium tracking-wide text-[#737373]">CR</span>
              <span className="w-32 text-[11px] font-medium tracking-wide text-[#737373]">SCHEDULE</span>
              <span className="w-16 text-right text-[11px] font-medium tracking-wide text-[#737373]">STATUS</span>
            </div>

            {/* Ra1 */}
            <div className="flex border-b border-[#f0f0f0] py-2.5 items-center">
              <span className="w-[88px] text-[13px] text-[#0a0a0a]">CS301</span>
              <span className="flex-1 text-[13px] text-[#0a0a0a]">Software Engineering</span>
              <span className="w-10 text-[13px] text-[#737373]">3</span>
              <span className="w-32 text-xs text-[#737373]">Mon 9–12</span>
              <span className="w-16 text-right text-xs font-medium text-[#16A34A]">Selected</span>
            </div>

            {/* Ra2 */}
            <div className="flex border-b border-[#f0f0f0] py-2.5 items-center">
              <span className="w-[88px] text-[13px] text-[#0a0a0a]">MATH201</span>
              <span className="flex-1 text-[13px] text-[#0a0a0a]">Calculus for Engineers</span>
              <span className="w-10 text-[13px] text-[#737373]">3</span>
              <span className="w-32 text-xs text-[#737373]">Thu 9–11</span>
              <span className="w-16 text-right text-xs font-medium text-[#00A6DD]">Resolved</span>
            </div>

            {/* Ra3 */}
            <div className="flex border-b border-[#f0f0f0] py-2.5 items-center">
              <span className="w-[88px] text-[13px] text-[#0a0a0a]">CS302</span>
              <span className="flex-1 text-[13px] text-[#0a0a0a]">Data Structures &amp; Algorithms</span>
              <span className="w-10 text-[13px] text-[#737373]">3</span>
              <span className="w-32 text-xs text-[#737373]">Fri 9–12</span>
              <span className="w-16 text-right text-xs font-medium text-[#16A34A]">Selected</span>
            </div>

            {/* Ra4 */}
            <div className="flex border-b border-[#f0f0f0] py-2.5 items-center">
              <span className="w-[88px] text-[13px] text-[#0a0a0a]">ENG102</span>
              <span className="flex-1 text-[13px] text-[#0a0a0a]">Academic English</span>
              <span className="w-10 text-[13px] text-[#737373]">2</span>
              <span className="w-32 text-xs text-[#737373]">Mon 13–15</span>
              <span className="w-16 text-right text-xs font-medium text-[#16A34A]">Selected</span>
            </div>

            {/* Ra5 (Backup) */}
            <div className="flex border-b border-[#00A6DD]/10 bg-[#00A6DD]/[0.05] -mx-6 px-6 py-2.5 items-center">
              <span className="w-[88px] text-[13px] text-[#0a0a0a]">CS290</span>
              <span className="flex-1 text-[13px] text-[#0a0a0a]">Web Application Development</span>
              <span className="w-10 text-[13px] text-[#737373]">3</span>
              <span className="w-32 text-xs text-[#737373]">Fri 13–15</span>
              <span className="w-16 text-right text-xs font-medium text-[#A89A6F]">Backup</span>
            </div>
          </div>

          <div className="h-6" /> {/* Separator gap */}

          {/* Schedule Visualization Title */}
          <div className="flex w-full items-center justify-between px-6 py-3">
            <h3 className="text-[13px] font-semibold text-[#0a0a0a]">Weekly Schedule Preview</h3>
            <span className="text-xs text-[#737373]">Mon &mdash; Fri</span>
          </div>

          {/* Visual Grid Layer */}
          <div className="flex w-full flex-1 min-h-[160px] gap-1 px-6 pb-6">
            
            {/* MON */}
            <div className="flex flex-1 flex-col gap-1.5 border-r border-[#f0f0f0] pr-1">
              <div className="text-center text-[10px] font-semibold text-[#737373] pb-1">MON</div>
              {/* Class block A */}
              <div className="flex flex-col gap-0.5 rounded shadow-sm bg-[#00A6DD] p-1.5 text-white">
                <span className="text-[10px] font-semibold leading-none">CS301</span>
                <span className="text-[9px] text-white/80 leading-none">9–12am</span>
              </div>
              {/* Class block B */}
              <div className="flex flex-col gap-0.5 rounded shadow-sm bg-[#16A34A] p-1.5 text-white mt-[8px]">
                <span className="text-[10px] font-semibold leading-none">ENG102</span>
                <span className="text-[9px] text-white/80 leading-none">1–3pm</span>
              </div>
            </div>

            {/* TUE */}
            <div className="flex flex-1 flex-col gap-1.5 border-r border-[#f0f0f0] px-1">
              <div className="text-center text-[10px] font-semibold text-[#737373] pb-1">TUE</div>
              {/* Empty Column */}
            </div>

            {/* WED */}
            <div className="flex flex-1 flex-col gap-1.5 border-r border-[#f0f0f0] px-1">
              <div className="text-center text-[10px] font-semibold text-[#737373] pb-1">WED</div>
              {/* Empty Column */}
            </div>

            {/* THU */}
            <div className="flex flex-1 flex-col gap-1.5 border-r border-[#f0f0f0] px-1">
              <div className="text-center text-[10px] font-semibold text-[#737373] pb-1">THU</div>
              {/* Class block A */}
              <div className="flex flex-col gap-0.5 rounded shadow-sm bg-[#7C3AED] p-1.5 text-white">
                <span className="text-[10px] font-semibold leading-none">MATH201</span>
                <span className="text-[9px] text-white/80 leading-none">9–11am</span>
              </div>
            </div>

            {/* FRI */}
            <div className="flex flex-1 flex-col gap-1.5 px-1">
              <div className="text-center text-[10px] font-semibold text-[#737373] pb-1">FRI</div>
              {/* Class block A */}
              <div className="flex flex-col gap-0.5 rounded shadow-sm bg-[#00A6DD] p-1.5 text-white">
                <span className="text-[10px] font-semibold leading-none">CS302</span>
                <span className="text-[9px] text-white/80 leading-none">9–12am</span>
              </div>
              {/* Class block B */}
              <div className="flex flex-col gap-0.5 rounded shadow-sm bg-[#A89A6F] p-1.5 text-white mt-[8px]">
                <span className="text-[10px] font-semibold leading-none">CS290 (alt)</span>
                <span className="text-[9px] text-white/80 leading-none">1–3pm</span>
              </div>
            </div>

          </div>
        </div>

        {/* Global Footer Controls Toolbar */}
        <div className="flex h-16 shrink-0 w-full items-center justify-between border-t border-[#e5e5e5] bg-white px-6">
          <button className="flex h-9 items-center justify-center rounded-md bg-[#00A6DD] px-5 text-sm font-medium text-white shadow-sm hover:bg-[#008dbf] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00A6DD]">
            Save My Course Choices
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#737373]">Registration opens Jan 15, 2569</span>
            <button className="flex h-9 items-center justify-center gap-2 rounded-md bg-[#DC0963] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#b50854] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DC0963]">
              <CalendarCheck className="h-4 w-4" />
              Register Now
            </button>
          </div>
        </div>
      </main>

    </div>
  )
}
