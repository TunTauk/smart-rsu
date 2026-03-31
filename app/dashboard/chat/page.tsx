import { Sparkles, Settings, Sun, Moon, Book, Zap, Leaf, Paperclip, Send } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f9fafb]">
      
      {/* Topbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A6DD]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[15px] font-semibold text-[#0a0a0a]">Enrollment Assistant</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
              <span className="text-xs text-[#16A34A]">Online &middot; Personalized for you</span>
            </div>
          </div>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] hover:bg-[#f5f5f5] transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-4 flex flex-col gap-5">
        
        {/* AI Msg 1 */}
        <div className="flex w-full xl:max-w-[75%] gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col gap-3 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white p-4 pb-5 shadow-sm">
            <p className="text-sm text-[#0a0a0a]">Hi Somchai! Here's a summary of your current enrollment:</p>
            
            <div className="flex flex-row overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f9fafb]">
              <div className="flex flex-1 flex-col justify-center border-r border-[#e5e5e5] px-4 py-3">
                <span className="text-xl font-bold text-[#00A6DD]">7</span>
                <span className="text-[11px] text-[#737373] mt-1 leading-snug">Subjects<br/>Registered</span>
              </div>
              <div className="flex flex-1 flex-col justify-center border-r border-[#e5e5e5] px-4 py-3">
                <span className="text-xl font-bold text-[#A89A6F]">72 cr.</span>
                <span className="text-[11px] text-[#737373] mt-1 leading-snug">Credits<br/>Earned</span>
              </div>
              <div className="flex flex-1 flex-col justify-center px-4 py-3">
                <span className="text-xl font-bold text-[#16A34A]">3.42</span>
                <span className="text-[11px] text-[#737373] mt-1 leading-snug">Cumulative<br/>GPA</span>
              </div>
            </div>

            <p className="text-[13px] text-[#737373]">We estimate you'll graduate in May 2027 at your current pace.</p>
          </div>
        </div>

        {/* AI Msg 2 */}
        <div className="flex w-full xl:max-w-[75%] gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-[#0a0a0a]">How many subjects would you like to register for this semester?</p>
          </div>
        </div>

        {/* User Msg 1 */}
        <div className="flex w-full justify-end">
          <div className="max-w-[75%] rounded-[16px_16px_0_16px] bg-[#00A6DD] px-4 py-3 shadow-sm">
            <p className="text-sm text-white">I'd like to take 4 subjects this semester.</p>
          </div>
        </div>

        {/* AI Msg 3 */}
        <div className="flex w-full xl:max-w-[75%] gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col gap-3 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#0a0a0a]">Are you a morning or evening person? This helps me find the best class times for you.</p>
            <div className="flex flex-wrap gap-2 text-[13px]">
              <button className="flex items-center gap-1.5 rounded-full bg-[#00A6DD] px-3.5 py-2 font-medium text-white transition-opacity hover:opacity-90">
                <Sun className="h-3.5 w-3.5" />
                Morning Person
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 py-2 font-medium text-[#737373] transition-colors hover:bg-[#e5e5e5]">
                <Moon className="h-3.5 w-3.5" />
                Evening Person
              </button>
            </div>
          </div>
        </div>

        {/* User Msg 2 */}
        <div className="flex w-full justify-end">
          <div className="max-w-[75%] rounded-[16px_16px_0_16px] bg-[#00A6DD] px-4 py-3 shadow-sm">
            <p className="text-sm text-white">Morning person! I prefer earlier classes.</p>
          </div>
        </div>

        {/* AI Msg 4 */}
        <div className="flex w-full xl:max-w-[75%] gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col gap-3 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#0a0a0a]">Which days do you prefer to attend class? You can select multiple.</p>
            <div className="flex flex-wrap gap-1.5">
              <button className="rounded-md bg-[#00A6DD] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">MON</button>
              <button className="rounded-md bg-[#00A6DD] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">TUE</button>
              <button className="rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-1.5 text-xs font-semibold text-[#737373] transition-colors hover:bg-[#e5e5e5]">WED</button>
              <button className="rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-1.5 text-xs font-semibold text-[#737373] transition-colors hover:bg-[#e5e5e5]">THU</button>
              <button className="rounded-md bg-[#00A6DD] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">FRI</button>
            </div>
          </div>
        </div>

        {/* AI Msg 5 */}
        <div className="flex w-full xl:max-w-[75%] gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] mt-1">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col gap-3 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#0a0a0a]">What kind of teaching environment do you prefer?</p>
            <div className="flex flex-wrap gap-2 text-[13px]">
              <button className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 py-2 font-medium text-[#737373] transition-colors hover:bg-[#e5e5e5]">
                <Book className="h-3.5 w-3.5" />
                Strict
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-[#DC0963] bg-[#DC0963]/10 px-3.5 py-2 font-medium text-[#DC0963] transition-colors hover:bg-[#DC0963]/20">
                <Zap className="h-3.5 w-3.5" />
                Energetic
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 py-2 font-medium text-[#737373] transition-colors hover:bg-[#e5e5e5]">
                <Leaf className="h-3.5 w-3.5" />
                Calm
              </button>
            </div>
          </div>
        </div>

        {/* User Msg 3 */}
        <div className="flex w-full justify-end">
          <div className="max-w-[75%] rounded-[16px_16px_0_16px] bg-[#00A6DD] px-4 py-3 shadow-sm">
            <p className="text-sm text-white">Energetic &mdash; I love interactive sessions!</p>
          </div>
        </div>

        {/* Typing Indicator */}
        <div className="flex w-full gap-3 mt-1 pb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex items-center gap-1 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white px-4 py-3 shadow-sm h-10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00A6DD] animate-bounce [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#00A6DD] opacity-60 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#00A6DD] opacity-30 animate-bounce" />
          </div>
        </div>

      </div>

      {/* Input Bar */}
      <div className="flex w-full shrink-0 items-center gap-3 border-t border-[#e5e5e5] bg-white px-6 py-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#f5f5f5] px-4 py-2.5">
          <button className="text-[#737373] hover:text-[#0a0a0a] transition-colors">
            <Paperclip className="h-4 w-4" />
          </button>
          <input 
            type="text" 
            placeholder="Ask me anything about your enrollment..." 
            className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#737373] outline-none"
          />
        </div>
        <button className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full bg-[#00A6DD] text-white shadow-sm hover:bg-[#008dbf] transition-colors">
          <Send className="h-4 w-4 ml-0.5" />
        </button>
      </div>

    </div>
  )
}
