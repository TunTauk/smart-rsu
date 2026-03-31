"use client";

import { useTransition, useState, useMemo, useRef, useCallback } from "react";
import { BookOpen, CalendarCheck, CalendarDays, ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react";
import { saveCourseSelection } from "@/app/dashboard/courses/actions";

const dayShortNames: Record<string, string> = {
  MONDAY: "MON",
  TUESDAY: "TUE",
  WEDNESDAY: "WED",
  THURSDAY: "THU",
  FRIDAY: "FRI",
  SATURDAY: "SAT",
  SUNDAY: "SUN",
};

const dayOrder: Record<string, number> = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
  FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
};

const courseColors = ["#00A6DD", "#A89A6F", "#16A34A", "#7C3AED", "#DC0963", "#F97316"];

const courseTypePill: Record<string, string> = {
  "Major Core": "bg-[#A89A6F]/10 text-[#A89A6F]",
  "Major Electives": "bg-[#00A6DD]/10 text-[#00A6DD]",
  "General Educations": "bg-[#16A34A]/10 text-[#16A34A]",
  "Free Elective": "bg-[#DC0963]/10 text-[#DC0963]",
};

export type RecommendedCourse = {
  id: number;
  sectionId: number;
  semesterSubjectId: number;
  subjectCode: string;
  subjectName: string;
  subjectType: string;
  credit: number;
  sectionCode: string;
  reason: string | null;
  meetings: { day_of_week: string; start_time: string; end_time: string }[];
};

export type AvailableSection = {
  sectionId: number;
  semesterSubjectId: number;
  subjectCode: string;
  subjectName: string;
  subjectType: string;
  credit: number;
  sectionCode: string;
  meetings: { day_of_week: string; start_time: string; end_time: string }[];
};

type Props = {
  recommended: RecommendedCourse[];
  available: AvailableSection[];
  semesterLabel: string;
  registrationDate: string | null;
  isRegistrationOpen: boolean;
};

function scheduleText(meetings: AvailableSection["meetings"]) {
  const m = [...meetings].sort((a, b) => (dayOrder[a.day_of_week] ?? 9) - (dayOrder[b.day_of_week] ?? 9))[0];
  return m ? `${dayShortNames[m.day_of_week] ?? m.day_of_week} ${m.start_time}–${m.end_time}` : "TBA";
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

type ConflictInfo = {
  newLabel: string;    // e.g. "CSC210 §241"
  existLabel: string;  // e.g. "CSC280 §141"
  day: string;         // e.g. "THU"
  time: string;        // e.g. "09:00–11:50"
};

function detectConflict(
  incoming: AvailableSection,
  keepSelected: AvailableSection[],
): ConflictInfo | null {
  for (const existing of keepSelected) {
    for (const nm of incoming.meetings) {
      for (const em of existing.meetings) {
        if (nm.day_of_week !== em.day_of_week) continue;
        const ns = toMinutes(nm.start_time), ne = toMinutes(nm.end_time);
        const es = toMinutes(em.start_time), ee = toMinutes(em.end_time);
        if (ns < ee && ne > es) {
          return {
            newLabel: `${incoming.subjectCode} §${incoming.sectionCode}`,
            existLabel: `${existing.subjectCode} §${existing.sectionCode}`,
            day: dayShortNames[em.day_of_week] ?? em.day_of_week,
            time: `${em.start_time}–${em.end_time}`,
          };
        }
      }
    }
  }
  return null;
}

export function CourseSelection({ recommended, available, semesterLabel, registrationDate, isRegistrationOpen }: Props) {
  const recommendedSectionIds = useMemo(() => new Set(recommended.map((r) => r.sectionId)), [recommended]);

  // Build subject → all sectionIds map (for radio deselection)
  const subjectSectionsMap = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const s of available) {
      const list = map.get(s.semesterSubjectId) ?? [];
      map.set(s.semesterSubjectId, [...list, s.sectionId]);
    }
    return map;
  }, [available]);

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(recommended.map((r) => r.sectionId)),
  );
  const [showAll, setShowAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4000);
  }, []);

  // Radio-like: selecting a section deselects all other sections of the same subject
  function selectSection(semesterSubjectId: number, sectionId: number) {
    const incoming = available.find((section) => section.sectionId === sectionId);

    if (!incoming) {
      return;
    }

    setSelected((prev) => {
      if (!prev.has(sectionId)) {
        const siblings = new Set(subjectSectionsMap.get(semesterSubjectId) ?? []);
        const keepSelected = available.filter(
          (section) => prev.has(section.sectionId) && !siblings.has(section.sectionId),
        );
        const conflict = detectConflict(incoming, keepSelected);

        if (conflict) {
          showToast(
            "error",
            `Cannot choose this time slot. Please remove the conflict slot ${conflict.existLabel} on ${conflict.day} ${conflict.time} first.`,
          );
          return prev;
        }
      }

      const next = new Set(prev);
      const siblings = subjectSectionsMap.get(semesterSubjectId) ?? [];
      for (const sid of siblings) next.delete(sid);
      if (!prev.has(sectionId)) next.add(sectionId); // toggle off if already selected
      return next;
    });
    setSaveStatus("idle");
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveCourseSelection(Array.from(selected));
        setSaveStatus("saved");
        showToast(
          "success",
          isRegistrationOpen
            ? "Your choices are saved. Registration is open now, and we will send you a reminder email as well."
            : "Your choices are saved. We will send you a reminder email when registration opens.",
        );
      } catch {
        setSaveStatus("error");
        showToast("error", "Failed to save your choices. Please try again.");
      }
    });
  };

  // Derive selected courses for schedule grid
  const selectedSections = useMemo(
    () => available.filter((s) => selected.has(s.sectionId)),
    [available, selected],
  );
  const totalCredits = selectedSections.reduce((sum, c) => sum + c.credit, 0);

  const scheduleEntries = selectedSections.flatMap((course, idx) =>
    course.meetings.map((m) => ({
      key: `${course.sectionId}-${m.day_of_week}`,
      code: course.subjectCode,
      day: m.day_of_week,
      start_time: m.start_time,
      end_time: m.end_time,
      color: courseColors[idx % courseColors.length],
    })),
  );

  // Group available sections by semesterSubjectId
  const availableGroupOrder = useMemo(() => {
    const order: number[] = [];
    const grouped = new Map<number, AvailableSection[]>();
    for (const s of available) {
      if (!grouped.has(s.semesterSubjectId)) {
        order.push(s.semesterSubjectId);
        grouped.set(s.semesterSubjectId, []);
      }
      grouped.get(s.semesterSubjectId)!.push(s);
    }
    return { order, grouped };
  }, [available]);

  const subjectCount = availableGroupOrder.order.length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

        {/* ─ AI Recommended ─ */}
        <section className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#f0f0f0] bg-[#f9fafb] px-4 py-3">
            <Sparkles className="h-3.5 w-3.5 text-[#00A6DD]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
              AI Recommended — {recommended.length} courses
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="w-10 px-4 py-2.5" />
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">Code</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">Subject Name</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">CR</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">Schedule</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {recommended.map((course) => {
                const isChecked = selected.has(course.sectionId);
                const typePill = courseTypePill[course.subjectType] ?? "bg-[#f5f5f5] text-[#737373]";
                const schedule = scheduleText(course.meetings);
                return (
                  <tr
                    key={course.id}
                    className={`cursor-pointer transition-colors hover:bg-[#fafafa] ${isChecked ? "" : "opacity-50"}`}
                    onClick={() => selectSection(course.semesterSubjectId, course.sectionId)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => selectSection(course.semesterSubjectId, course.sectionId)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-[#d4d4d4] accent-[#00A6DD]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[#00A6DD]">{course.subjectCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0a0a0a]">{course.subjectName}</div>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${typePill}`}>
                        {course.subjectType}
                      </span>
                      {course.reason && (
                        <p className="mt-1 text-[11px] leading-4 text-[#737373]">
                          <span className="font-medium text-[#00A6DD]">Why: </span>
                          {course.reason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-[#0a0a0a]">{course.credit}</td>
                    <td className="px-4 py-3 text-[#4a4a4a]">{schedule}</td>
                    <td className="px-4 py-3 text-[#4a4a4a]">{course.sectionCode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ─ All Available Subjects (grouped) ─ */}
        <section className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex w-full items-center justify-between border-b border-[#f0f0f0] bg-[#f9fafb] px-4 py-3 text-left transition-colors hover:bg-[#f5f5f5]"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
                All Available Subjects — {subjectCount} subjects
              </span>
              <span className="rounded-full bg-[#A89A6F]/10 px-2 py-0.5 text-[10px] font-medium text-[#A89A6F]">
                {semesterLabel}
              </span>
            </div>
            {showAll ? <ChevronUp className="h-4 w-4 text-[#737373]" /> : <ChevronDown className="h-4 w-4 text-[#737373]" />}
          </button>

          {showAll && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  <th className="w-10 px-4 py-2.5" />
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">Schedule</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">Section</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">AI Pick</th>
                </tr>
              </thead>
              <tbody>
                {availableGroupOrder.order.map((subjectId) => {
                  const sections = availableGroupOrder.grouped.get(subjectId)!;
                  const first = sections[0];
                  const typePill = courseTypePill[first.subjectType] ?? "bg-[#f5f5f5] text-[#737373]";
                  const selectedInGroup = sections.find((s) => selected.has(s.sectionId));

                  return (
                    <>
                      {/* Subject group header */}
                      <tr key={`hdr-${subjectId}`} className="bg-[#f0f7ff]">
                        <td colSpan={4} className="border-l-4 border-[#00A6DD] py-2.5 pl-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#00A6DD]">{first.subjectCode}</span>
                            <span className="text-[#d4d4d4]">·</span>
                            <span className="text-[13px] font-medium text-[#0a0a0a]">{first.subjectName}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typePill}`}>
                              {first.subjectType}
                            </span>
                            <span className="text-[11px] text-[#737373]">{first.credit} cr</span>
                            <span className="ml-auto rounded-full bg-[#00A6DD]/10 px-2 py-0.5 text-[11px] font-semibold text-[#00A6DD]">
                              {sections.length} section{sections.length !== 1 ? "s" : ""}
                            </span>
                            {selectedInGroup && (
                              <span className="rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                                ✓ §{selectedInGroup.sectionCode}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Section rows */}
                      {sections.map((section, idx) => {
                        const isChecked = selected.has(section.sectionId);
                        const isRecommended = recommendedSectionIds.has(section.sectionId);
                        const isLast = idx === sections.length - 1;
                        const schedule = scheduleText(section.meetings);

                        return (
                          <tr
                            key={section.sectionId}
                            className={`cursor-pointer transition-colors ${isChecked ? "bg-[#f0fff4]" : "hover:bg-[#f0f7ff]"} ${isLast ? "" : "border-b border-[#e8f4fb]"}`}
                            onClick={() => selectSection(section.semesterSubjectId, section.sectionId)}
                          >
                            <td className="border-l-4 border-[#00A6DD]/25 py-3 pl-7 pr-4 text-center">
                              <input
                                type="radio"
                                checked={isChecked}
                                onChange={() => selectSection(section.semesterSubjectId, section.sectionId)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 accent-[#00A6DD]"
                              />
                            </td>
                            <td className="px-4 py-3 text-[#4a4a4a]">{schedule}</td>
                            <td className="px-4 py-3 font-medium text-[#0a0a0a]">{section.sectionCode}</td>
                            <td className="px-4 py-3 text-center">
                              {isRecommended ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#00A6DD]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00A6DD]">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  AI
                                </span>
                              ) : (
                                <span className="text-[#d4d4d4]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Group spacer */}
                      <tr key={`gap-${subjectId}`}><td colSpan={4} className="h-1.5 bg-[#f9fafb]" /></tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* ─ Weekly Schedule Preview ─ */}
        <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
            <CalendarDays className="h-4 w-4 text-[#00A6DD]" />
            Weekly Schedule Preview
            <span className="ml-auto text-xs font-normal text-[#737373]">
              {selected.size} selected · {totalCredits} credits
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const).map((day) => {
              const dayCourses = scheduleEntries.filter((e) => e.day === day);
              return (
                <div key={day} className="rounded-xl bg-[#f9fafb] p-2.5">
                  <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
                    {dayShortNames[day]}
                  </div>
                  <div className="space-y-1.5">
                    {dayCourses.length > 0 ? (
                      dayCourses.map((c) => (
                        <div key={c.key} className="rounded-lg p-2 text-white" style={{ backgroundColor: c.color }}>
                          <div className="text-[11px] font-semibold leading-tight">{c.code}</div>
                          <div className="mt-0.5 text-[10px] text-white/80">{c.start_time}–{c.end_time}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#d4d4d4] py-5 text-center text-[10px] text-[#a3a3a3]">
                        No class
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-[#e5e5e5] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-[#00A6DD] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#008dbf] disabled:opacity-60"
          >
            <BookOpen className="h-4 w-4" />
            {isPending ? "Saving…" : "Save My Course Choices"}
          </button>
          {saveStatus === "saved" && <span className="text-xs font-medium text-[#16A34A]">Saved successfully</span>}
          {saveStatus === "error" && <span className="text-xs font-medium text-[#DC0963]">Failed to save. Try again.</span>}
        </div>
        <span className="text-xs text-[#737373]">
          {registrationDate ? `Registration opens ${registrationDate}` : "Check registration dates"}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-[#DC0963] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b50751]"
        >
          <CalendarCheck className="h-4 w-4" />
          Register Now
        </button>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                toast.type === "success" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#DC0963]/10 text-[#DC0963]"
              }`}
            >
              {toast.type === "success" ? <CalendarCheck className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            </div>
            <p className="text-sm leading-6 text-[#0a0a0a]">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
