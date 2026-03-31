import { Hexagon, LayoutDashboard, MessageCircle, BookOpen, Calendar, User, LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full font-sans bg-[#f9fafb]">
      
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 flex h-screen w-[256px] flex-col gap-2 border-r border-[#e5e5e5] bg-white p-2">
        
        {/* Brand */}
        <div className="flex items-center gap-2 rounded-lg bg-[#A89A6F]/10 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A89A6F]">
            <Hexagon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#0a0a0a]">Smart RSU</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {/* Active Item */}
          <a href="#" className="flex items-center gap-2 rounded-md bg-[#00A6DD]/10 px-2 py-2">
            <LayoutDashboard className="h-4 w-4 text-[#00A6DD]" />
            <span className="text-sm font-semibold text-[#00A6DD]">Home</span>
          </a>
          
          {/* Inactive Items */}
          <a href="#" className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f5f5] transition-colors">
            <MessageCircle className="h-4 w-4 text-[#737373]" />
            <span className="text-sm font-medium text-[#0a0a0a]">Chat Assistant</span>
          </a>
          
          <a href="#" className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f5f5] transition-colors">
            <BookOpen className="h-4 w-4 text-[#737373]" />
            <span className="text-sm font-medium text-[#0a0a0a]">My Courses</span>
          </a>
          
          <a href="#" className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f5f5] transition-colors">
            <Calendar className="h-4 w-4 text-[#737373]" />
            <span className="text-sm font-medium text-[#0a0a0a]">Schedule</span>
          </a>
          
          <a href="#" className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f5f5] transition-colors">
            <User className="h-4 w-4 text-[#737373]" />
            <span className="text-sm font-medium text-[#0a0a0a]">Profile</span>
          </a>
        </nav>

        {/* Footer Profile */}
        <div className="mt-auto flex items-center gap-2 border-t border-[#e5e5e5] pt-2 px-1 pb-1">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#00A6DD] text-[13px] font-bold text-white">
            S
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="truncate text-[13px] font-medium text-[#0a0a0a]">Somchai Jaidee</span>
            <span className="truncate text-[11px] text-[#737373]">Student ID: 6501234567</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] hover:bg-[#f5f5f5] transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="ml-[256px] flex flex-1 flex-col overflow-x-hidden min-h-screen">
        {children}
      </main>

    </div>
  )
}
