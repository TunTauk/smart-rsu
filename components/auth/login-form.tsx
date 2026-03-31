"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/auth";

const initialLoginFormState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 bg-[#00A6DD] py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? "Signing In..." : "Sign In"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialLoginFormState);

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      <div className="relative hidden w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#00A6DD] via-[#1565C0] to-[#DC0963] p-12 lg:flex lg:w-[40%] xl:w-[560px]">
        <div className="absolute -left-[100px] -top-[100px] h-[320px] w-[320px] rounded-full bg-white/5" />
        <div className="absolute left-[370px] top-[680px] h-[280px] w-[280px] rounded-full bg-white/5" />
        <div className="absolute left-[440px] top-[80px] h-[180px] w-[180px] rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center text-white">
          <div className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Hexagon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Smart RSU</h1>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
            <span className="text-xs font-medium text-white/80">Powered by AI</span>
          </div>

          <h2 className="max-w-[400px] text-xl font-semibold leading-relaxed">
            Your AI-powered degree audit
            <br />& enrollment assistant
          </h2>

          <p className="text-[13px] text-white/50">Rangsit University</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-8 lg:flex-1 lg:p-12">
        <form
          action={formAction}
          className="flex w-full max-w-[440px] flex-col gap-5 rounded-2xl bg-white lg:p-12"
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-[#0a0a0a]">Welcome back</h1>
            <p className="text-sm text-[#737373]">Sign in to your account</p>
          </div>

          <div className="mt-2 flex flex-col gap-3.5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="student@rsu.ac.th" autoComplete="email" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="flex w-full justify-start">
            <a href="#" className="text-[13px] font-normal text-[#00A6DD] hover:underline">
              Forgot password?
            </a>
          </div>

          {state.error ? <p className="text-sm text-[#DC0963]">{state.error}</p> : null}

          <SubmitButton />

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[13px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="h-10 w-full py-2" type="button">
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
}
