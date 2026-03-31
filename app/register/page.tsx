import { Upload, FileUp, ListPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-sans bg-white">
      
      {/* Left side - Step 1 */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 lg:p-12 bg-white">
        <div className="flex w-full max-w-[420px] flex-col gap-8 lg:gap-10">
          
          {/* Header */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00A6DD]/10 px-3 py-1 w-max">
              <div className="h-2 w-2 rounded-full bg-[#00A6DD]" />
              <span className="text-xs font-semibold text-[#00A6DD]">Step 1 of 2</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0a0a0a]">Create your account</h1>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullname">Full name</Label>
              <Input id="fullname" type="text" placeholder="e.g. Somchai Jaidee" />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="studentid">Student ID</Label>
              <Input id="studentid" type="text" placeholder="e.g. 6501234567" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@rsu.ac.th" />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Input id="faculty" type="text" placeholder="Select your faculty..." />
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 w-full bg-[#00A6DD] text-white hover:bg-[#008dbf] border-0 h-10 py-2">
            Continue &rarr;
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-[#e5e5e5]" />

      {/* Right side - Step 2 */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 lg:p-12 bg-[#f9fafb]">
        <div className="flex w-full max-w-[560px] flex-col gap-5">
          
          {/* Header */}
          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#A89A6F]/10 px-3 py-1 w-max">
              <div className="h-2 w-2 rounded-full bg-[#A89A6F]" />
              <span className="text-xs font-semibold text-[#A89A6F]">Step 2 of 2</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">Import your transcript</h1>
              <p className="text-sm text-[#737373]">Help us understand your academic progress. Choose a method below.</p>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            
            {/* Option A: Upload */}
            <div className="flex flex-col flex-1 gap-3 rounded-xl border border-[#e5e5e5] bg-white p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#00A6DD]/10">
                <Upload className="h-5 w-5 text-[#00A6DD]" />
              </div>
              <div className="flex flex-col gap-1">
                 <h3 className="text-sm font-semibold text-[#0a0a0a]">Upload Transcript PDF</h3>
                 <p className="text-xs text-[#737373]">Browse or drag & drop your official transcript</p>
              </div>
              
              <div className="mt-2 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#00A6DD] bg-[#00A6DD]/[0.08] p-4 text-center">
                <FileUp className="h-6 w-6 text-[#00A6DD]" />
                <span className="text-xs text-[#737373]">Drop transcript.pdf here</span>
              </div>

              <div className="mt-1">
                <Button variant="outline" className="w-full text-xs h-9">
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Option B: Manual */}
            <div className="flex flex-col flex-1 gap-3 rounded-xl border border-[#e5e5e5] bg-white p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#DC0963]/10">
                <ListPlus className="h-5 w-5 text-[#DC0963]" />
              </div>
              <div className="flex flex-col gap-1">
                 <h3 className="text-sm font-semibold text-[#0a0a0a]">Enter Courses Manually</h3>
                 <p className="text-xs text-[#737373]">Add each completed subject one by one</p>
              </div>

              <div className="mt-2 flex flex-col w-full text-left">
                {/* Table Header */}
                <div className="flex gap-2 rounded-md bg-[#f5f5f5] px-2 py-1.5 align-middle">
                  <span className="w-12 text-[11px] font-medium text-[#737373]">Code</span>
                  <span className="flex-1 text-[11px] font-medium text-[#737373]">Subject Name</span>
                  <span className="w-6 text-[11px] font-medium text-[#737373] text-center">Cr.</span>
                  <span className="w-8 text-[11px] font-medium text-[#737373] text-center">Grade</span>
                </div>
                {/* Table Row */}
                <div className="flex gap-2 border-b border-[#e5e5e5] px-2 py-2 items-center">
                  <span className="w-12 text-xs text-[#0a0a0a]">CS101</span>
                  <span className="flex-1 text-[11px] leading-tight text-[#0a0a0a] line-clamp-2">Introduction to Programming</span>
                  <span className="w-6 text-xs text-[#0a0a0a] text-center">3</span>
                  <span className="w-8 text-xs font-semibold text-[#00A6DD] text-center">A</span>
                </div>
              </div>

              <button className="mt-1 inline-flex items-center gap-1.5 px-1 py-1 text-left hover:opacity-80 transition-opacity">
                <Plus className="h-3.5 w-3.5 text-[#00A6DD]" />
                <span className="text-xs font-medium text-[#00A6DD]">Add a course</span>
              </button>
            </div>

          </div>

          <div className="mt-4 flex w-full flex-col items-center gap-5">
            <a href="#" className="text-[13px] text-[#737373] hover:underline">
              I'm a new student &mdash; skip this step
            </a>
            
            <button className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 w-full bg-[#00A6DD] text-white hover:bg-[#008dbf] border-0 h-10 py-2">
              Finish Setup
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
