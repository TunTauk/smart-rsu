"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Shield, Hexagon, Loader2, AlertCircle, Lock, Mail } from "lucide-react"
import { adminLogin } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#A89A6F] text-sm font-semibold text-white transition-all hover:bg-[#97896a] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying…
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Access Admin Panel
        </>
      )}
    </button>
  )
}

export default function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLogin, { error: null })

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left panel — dark brand side */}
      <div className="relative hidden w-[420px] shrink-0 flex-col items-center justify-between overflow-hidden bg-[#0a0a0a] p-12 lg:flex">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#A89A6F]/10" />
        <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-[#A89A6F]/8" />
        <div className="absolute right-12 top-40 h-40 w-40 rounded-full bg-[#A89A6F]/5" />

        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A89A6F]">
            <Hexagon className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold text-white">Smart RSU</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#A89A6F]/30 bg-[#A89A6F]/10">
            <Shield className="h-10 w-10 text-[#A89A6F]" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="max-w-[240px] text-sm leading-relaxed text-white/50">
              Restricted access for authorized administrators only
            </p>
          </div>
          <div className="flex flex-col gap-3 text-left">
            {[
              "Manage instructors & profiles",
              "Create and edit subject catalog",
              "Configure course plans & schedules",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A89A6F]" />
                <span className="text-[13px] text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#A89A6F]" />
          <span className="text-[11px] font-medium text-white/50">Rangsit University · Smart RSU</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f9fafb] p-8">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0a0a]">
              <Hexagon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#0a0a0a]">Smart RSU</span>
          </div>

          {/* Admin badge */}
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#A89A6F]/30 bg-[#A89A6F]/8 px-3.5 py-2.5">
            <Shield className="h-4 w-4 shrink-0 text-[#A89A6F]" />
            <span className="text-[13px] font-medium text-[#A89A6F]">
              Administrator Access Only
            </span>
          </div>

          <div className="mb-8 flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-[#0a0a0a]">Admin Sign In</h2>
            <p className="text-sm text-[#737373]">Enter your admin credentials to continue</p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium text-[#0a0a0a]">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="admin@rsu.ac.th"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-lg border border-[#e5e5e5] bg-white pl-10 pr-4 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#A89A6F]/40 transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-[#0a0a0a]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border border-[#e5e5e5] bg-white pl-10 pr-4 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#A89A6F]/40 transition-shadow"
                />
              </div>
            </div>

            {/* Error */}
            {state.error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <div className="pt-1">
              <SubmitButton />
            </div>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#737373]">
            Not an admin?{" "}
            <a href="/" className="font-medium text-[#00A6DD] hover:underline">
              Student &amp; Instructor login →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
