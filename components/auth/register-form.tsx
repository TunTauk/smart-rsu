"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { FileUp, Hexagon, Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register, type RegisterState } from "@/app/actions/register";

type Major = { id: number; code: string; name: string };
type Subject = { code: string; name: string };

type CourseRow = {
  id: string;
  code: string;
  name: string;
  credit: string;
  grade: string;
  semesterNo: string;
  semesterYear: string;
};

type ParsedTranscriptCourse = Omit<CourseRow, "id"> & {
  name?: string;
};

const GRADES = ["A", "B+", "B", "C+", "C", "D+", "D", "F", "W", "S", "U"];

const initialState: RegisterState = { error: null };

function FinishButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 bg-[#00A6DD] py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Creating account..." : "Finish Setup"}
    </button>
  );
}

export function RegisterForm({ majors, subjects }: { majors: Major[]; subjects: Subject[] }) {
  const [state, formAction] = useActionState(register, initialState);
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [isParsingTranscript, setIsParsingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [transcriptFileName, setTranscriptFileName] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [majorId, setMajorId] = useState("");
  const subjectNameByCode = new Map(subjects.map((subject) => [subject.code.toUpperCase(), subject.name]));

  function resolveSubjectName(code: string, fallbackName = "") {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return fallbackName;
    }

    return subjectNameByCode.get(normalizedCode) ?? fallbackName;
  }

  function validateAndContinue() {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Required";
    if (!studentId.trim()) errors.studentId = "Required";
    if (!email.trim()) errors.email = "Required";
    if (!password.trim()) errors.password = "Required";
    else if (password.length < 8) errors.password = "Min 8 characters";
    if (!majorId) errors.majorId = "Please select your major";
    setStep1Errors(errors);
    if (Object.keys(errors).length === 0) setStep(2);
  }

  function addCourse() {
    setCourses((prev) => [
      ...prev,
      { id: crypto.randomUUID(), code: "", name: "", credit: "3", grade: "A", semesterNo: "", semesterYear: "" },
    ]);
  }

  function removeCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCourse(id: string, field: keyof Omit<CourseRow, "id">, value: string) {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== id) {
          return course;
        }

        if (field === "code") {
          return {
            ...course,
            code: value,
            name: resolveSubjectName(value, course.name),
          };
        }

        return { ...course, [field]: value };
      }),
    );
  }

  async function handleTranscriptUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setTranscriptError("Please upload a PDF transcript.");
      return;
    }

    setIsParsingTranscript(true);
    setTranscriptError(null);
    setTranscriptFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcript/parse", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        error?: string;
        courses?: ParsedTranscriptCourse[];
      };

      if (!response.ok) {
        setTranscriptError(payload.error ?? "Failed to parse transcript.");
        return;
      }

      const parsedCourses = (payload.courses ?? []).map((course) => ({
        id: crypto.randomUUID(),
        code: course.code ?? "",
        name: resolveSubjectName(course.code ?? "", course.name ?? ""),
        credit: String(course.credit ?? ""),
        grade: course.grade ?? "A",
        semesterNo: course.semesterNo == null ? "" : String(course.semesterNo),
        semesterYear: course.semesterYear == null ? "" : String(course.semesterYear),
      }));

      if (parsedCourses.length === 0) {
        setTranscriptError("No courses were detected in that PDF. You can still add them manually below.");
        return;
      }

      setCourses(parsedCourses);
    } catch {
      setTranscriptError("Failed to parse transcript.");
    } finally {
      setIsParsingTranscript(false);
    }
  }

  const coursesJson = JSON.stringify(
    courses.map((course) => ({
      code: course.code,
      name: course.name,
      credit: course.credit,
      grade: course.grade,
      semesterNo: course.semesterNo,
      semesterYear: course.semesterYear,
    })).filter((c) => c.code.trim()),
  );

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left branding panel */}
      <div className="relative hidden w-[420px] flex-shrink-0 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#00A6DD] via-[#1565C0] to-[#DC0963] p-12 lg:flex">
        <div className="absolute -left-[100px] -top-[100px] h-[320px] w-[320px] rounded-full bg-white/5" />
        <div className="absolute left-[300px] top-[640px] h-[280px] w-[280px] rounded-full bg-white/5" />
        <div className="absolute left-[360px] top-[60px] h-[180px] w-[180px] rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-center gap-8 text-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
              <Hexagon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Smart RSU</h1>
            <p className="text-sm text-white/60">Rangsit University</p>
          </div>

          {/* Step indicators */}
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= 1 ? "bg-white text-[#00A6DD]" : "bg-white/20 text-white/60"
                }`}
              >
                1
              </div>
              <div className={`h-px w-14 transition-colors ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= 2 ? "bg-white text-[#00A6DD]" : "bg-white/20 text-white/60"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex gap-10 text-xs">
              <span className={step === 1 ? "font-semibold text-white" : "text-white/50"}>Account Info</span>
              <span className={step === 2 ? "font-semibold text-white" : "text-white/50"}>Course History</span>
            </div>
          </div>

          <p className="max-w-[260px] text-sm text-white/50 leading-relaxed">
            Your AI-powered degree audit &amp; enrollment assistant
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-8 lg:p-12">
        <form action={formAction} className={`w-full ${step === 2 ? "max-w-[820px]" : "max-w-[480px]"}`}>
          {/* Hidden inputs — always submitted regardless of step */}
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="majorId" value={majorId} />
          <input type="hidden" name="courses" value={coursesJson} />

          {/* ── STEP 1: Account Info ── */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#00A6DD]/10 px-3 py-1 w-max">
                  <div className="h-2 w-2 rounded-full bg-[#00A6DD]" />
                  <span className="text-xs font-semibold text-[#00A6DD]">Step 1 of 2</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">Create your account</h1>
                <p className="text-sm text-[#737373]">Enter your student information to get started.</p>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name-input">Full name</Label>
                  <Input
                    id="name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Somchai Jaidee"
                  />
                  {step1Errors.name && <p className="text-xs text-[#DC0963]">{step1Errors.name}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="studentid-input">Student ID</Label>
                  <Input
                    id="studentid-input"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 6501234567"
                  />
                  {step1Errors.studentId && <p className="text-xs text-[#DC0963]">{step1Errors.studentId}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email-input">Email</Label>
                  <Input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@rsu.ac.th"
                    autoComplete="email"
                  />
                  {step1Errors.email && <p className="text-xs text-[#DC0963]">{step1Errors.email}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password-input">Password</Label>
                  <Input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  {step1Errors.password && <p className="text-xs text-[#DC0963]">{step1Errors.password}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="major-input">Major</Label>
                  <select
                    id="major-input"
                    value={majorId}
                    onChange={(e) => setMajorId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select your major...</option>
                    {majors.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                  {step1Errors.majorId && <p className="text-xs text-[#DC0963]">{step1Errors.majorId}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={validateAndContinue}
                className="mt-1 inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 bg-[#00A6DD] py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] focus-visible:outline-none"
              >
                Continue →
              </button>

              <p className="text-center text-[12px] text-[#a3a3a3]">
                Already have an account?{" "}
                <Link href="/" className="text-[#00A6DD] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Course History ── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#A89A6F]/10 px-3 py-1 w-max">
                  <div className="h-2 w-2 rounded-full bg-[#A89A6F]" />
                  <span className="text-xs font-semibold text-[#A89A6F]">Step 2 of 2</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">Course History</h1>
                <p className="text-sm text-[#737373]">
                  Add subjects you&apos;ve already completed. Use RSU course codes (e.g.{" "}
                  <span className="font-mono text-[#0a0a0a]">CSC101</span>). Unrecognized codes will be skipped.
                </p>
              </div>

              <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
                <div className="flex flex-col gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0a0a0a]">Upload transcript PDF</h2>
                    <p className="mt-1 text-xs leading-5 text-[#737373]">
                      If you already have an RSU transcript PDF, upload it to prefill your course history. You can review and edit the extracted rows before finishing registration.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#00A6DD]/40 bg-white px-4 py-4 text-sm font-medium text-[#00A6DD] transition-colors hover:border-[#00A6DD] hover:bg-[#00A6DD]/[0.04]">
                    {isParsingTranscript ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                    <span>{isParsingTranscript ? "Parsing transcript..." : "Choose transcript PDF"}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      disabled={isParsingTranscript}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          void handleTranscriptUpload(file);
                        }

                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {transcriptFileName ? (
                    <p className="text-xs text-[#737373]">
                      Selected file: <span className="font-medium text-[#0a0a0a]">{transcriptFileName}</span>
                    </p>
                  ) : null}

                  {transcriptError ? <p className="text-xs text-[#DC0963]">{transcriptError}</p> : null}
                </div>
              </div>

              {/* Course table */}
              <div className="overflow-hidden rounded-xl border border-[#e5e5e5]">
                {/* Header */}
                <div className="grid grid-cols-[100px_minmax(180px,1.5fr)_minmax(160px,1fr)_52px_72px_36px] gap-2 bg-[#f5f5f5] px-3 py-2.5">
                  <span className="text-[11px] font-medium text-[#737373]">Course Code</span>
                  <span className="text-[11px] font-medium text-[#737373]">Subject Name</span>
                  <span className="text-[11px] font-medium text-[#737373]">Semester / Year (B.E.)</span>
                  <span className="text-center text-[11px] font-medium text-[#737373]">Credits</span>
                  <span className="text-center text-[11px] font-medium text-[#737373]">Grade</span>
                  <span />
                </div>

                {/* Rows */}
                {courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                    <p className="text-sm text-[#a3a3a3]">No courses added yet.</p>
                    <p className="text-xs text-[#c3c3c3]">Click &ldquo;Add course&rdquo; below to begin.</p>
                  </div>
                ) : (
                  courses.map((course, i) => (
                    <div
                      key={course.id}
                      className={`grid grid-cols-[100px_minmax(180px,1.5fr)_minmax(160px,1fr)_52px_72px_36px] gap-2 px-3 py-2 items-center ${
                        i < courses.length - 1 ? "border-b border-[#e5e5e5]" : ""
                      }`}
                    >
                      <input
                        className="h-8 w-full rounded border border-[#e5e5e5] bg-white px-2 font-mono text-xs uppercase placeholder-[#c3c3c3] focus:border-[#00A6DD] focus:outline-none"
                        placeholder="CSC101"
                        value={course.code}
                        onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                      />
                      <input
                        className="h-8 w-full rounded border border-[#e5e5e5] bg-white px-2 text-xs placeholder-[#c3c3c3] focus:border-[#00A6DD] focus:outline-none"
                        placeholder="Introduction to Programming"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                      />
                      <div className="flex gap-1.5">
                        <input
                          className="h-8 w-10 rounded border border-[#e5e5e5] bg-white px-1.5 text-center text-xs placeholder-[#c3c3c3] focus:border-[#00A6DD] focus:outline-none"
                          placeholder="1"
                          maxLength={1}
                          value={course.semesterNo}
                          onChange={(e) => updateCourse(course.id, "semesterNo", e.target.value)}
                        />
                        <input
                          className="h-8 flex-1 rounded border border-[#e5e5e5] bg-white px-2 text-xs placeholder-[#c3c3c3] focus:border-[#00A6DD] focus:outline-none"
                          placeholder="2566"
                          maxLength={4}
                          value={course.semesterYear}
                          onChange={(e) => updateCourse(course.id, "semesterYear", e.target.value)}
                        />
                      </div>
                      <input
                        className="h-8 w-full rounded border border-[#e5e5e5] bg-white px-2 text-center text-xs placeholder-[#c3c3c3] focus:border-[#00A6DD] focus:outline-none"
                        placeholder="3"
                        maxLength={1}
                        value={course.credit}
                        onChange={(e) => updateCourse(course.id, "credit", e.target.value)}
                      />
                      <select
                        className="h-8 w-full rounded border border-[#e5e5e5] bg-white px-1 text-center text-xs focus:border-[#00A6DD] focus:outline-none"
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCourse(course.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-[#a3a3a3] transition-colors hover:bg-[#DC0963]/10 hover:text-[#DC0963]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}

                {/* Add row */}
                <div className="border-t border-[#e5e5e5] px-3 py-2.5">
                  <button
                    type="button"
                    onClick={addCourse}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00A6DD] transition-opacity hover:opacity-70"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add course
                  </button>
                </div>
              </div>

              {state.error && <p className="text-sm text-[#DC0963]">{state.error}</p>}

              <FinishButton />

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[13px] text-[#737373] hover:underline"
                >
                  ← Back to account info
                </button>
                <p className="text-center text-[12px] text-[#a3a3a3]">
                  New student with no prior courses? Leave the table empty and click Finish Setup.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
