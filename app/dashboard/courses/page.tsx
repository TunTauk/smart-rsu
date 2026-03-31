import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";
import { CourseSelection, type AvailableSection, type RecommendedCourse } from "@/components/courses/course-selection";

const dayOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export default async function CoursesPage() {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    redirect("/");
  }

  const studentId = user.student.id;

  const [recommendation, latestConversation] = await Promise.all([
    prisma.student_recommendations.findFirst({
      where: { student_id: studentId },
      include: {
        semester_schedule: true,
        recommendation_subjects: {
          include: {
            semester_subject: { include: { subject: true } },
            semester_section: { include: { meetings: true } },
          },
        },
      },
      orderBy: { updated_at: "desc" },
    }),
    prisma.recommendation_conversations.findFirst({
      where: { student_id: studentId },
      include: {
        messages: {
          where: { role: "ASSISTANT" },
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
      orderBy: { updated_at: "desc" },
    }),
  ]);

  if (!recommendation || recommendation.recommendation_subjects.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f9fafb] px-6 py-12">
        <div className="flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00A6DD]/10 text-[#00A6DD]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-[#0a0a0a]">No course recommendations yet</h1>
            <p className="text-sm leading-6 text-[#737373]">
              Answer the planning questions in the chat assistant and we will generate a validated course list for your
              next semester.
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center justify-center rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf]"
          >
            Start planning
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all available sections for the active semester
  const allSections = await prisma.semester_sections.findMany({
    where: {
      semester_subject: {
        semester_schedule_id: recommendation.semester_schedule_id,
      },
    },
    include: {
      semester_subject: { include: { subject: true } },
      meetings: true,
    },
    orderBy: { id: "asc" },
  });

  const recommendedCourses: RecommendedCourse[] = recommendation.recommendation_subjects
    .map((item) => ({
      id: item.id,
      sectionId: item.semester_section_id,
      semesterSubjectId: item.semester_subject_id,
      subjectCode: item.semester_subject.subject.code,
      subjectName: item.semester_subject.subject.name,
      subjectType: item.semester_subject.subject.type,
      credit: item.semester_subject.subject.credit,
      sectionCode: item.semester_section.code,
      reason: (item as { reason?: string | null }).reason ?? null,
      meetings: item.semester_section.meetings
        .map((m) => ({
          day_of_week: m.day_of_week as string,
          start_time: m.start_time,
          end_time: m.end_time,
        }))
        .sort((a, b) => (dayOrder[a.day_of_week] ?? 9) - (dayOrder[b.day_of_week] ?? 9)),
    }))
    .sort((a, b) => {
      const la = a.meetings[0] ? (dayOrder[a.meetings[0].day_of_week] ?? 9) : 99;
      const lb = b.meetings[0] ? (dayOrder[b.meetings[0].day_of_week] ?? 9) : 99;
      return la !== lb ? la - lb : a.subjectCode.localeCompare(b.subjectCode);
    });

  const availableSections: AvailableSection[] = allSections.map((section) => ({
    sectionId: section.id,
    semesterSubjectId: section.semester_subject_id,
    subjectCode: section.semester_subject.subject.code,
    subjectName: section.semester_subject.subject.name,
    subjectType: section.semester_subject.subject.type,
    credit: section.semester_subject.subject.credit,
    sectionCode: section.code,
    meetings: section.meetings
      .map((m) => ({
        day_of_week: m.day_of_week as string,
        start_time: m.start_time,
        end_time: m.end_time,
      }))
      .sort((a, b) => (dayOrder[a.day_of_week] ?? 9) - (dayOrder[b.day_of_week] ?? 9)),
  }));

  const assistantSummary = latestConversation?.messages[0]?.content ?? null;
  const semesterLabel = `Semester ${recommendation.semester_schedule.semester_no} / ${recommendation.semester_schedule.semester_year}`;

  // Format registration date
  const regDate = recommendation.semester_schedule.registration_date;
  const registrationDate = regDate
    ? new Date(regDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const isRegistrationOpen = regDate ? new Date(regDate) <= new Date() : false;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f9fafb]">
      {/* ── Header ── */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[#00A6DD]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">AI Recommendations</span>
          </div>
          <span className="text-[#d4d4d4]">/</span>
          <h1 className="text-sm font-semibold text-[#0a0a0a]">Course Recommendations</h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-[#A89A6F]/10 px-2.5 py-1 font-medium text-[#A89A6F]">{semesterLabel}</span>
          <span className="rounded-full bg-[#00A6DD]/10 px-2.5 py-1 font-medium text-[#00A6DD]">
            {recommendedCourses.length} recommended
          </span>
          <span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 font-medium text-[#16A34A]">
            {availableSections.length} available
          </span>
        </div>
      </header>

      {/* ── Body (sidebar + interactive content) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — AI Summary */}
        <aside className="flex w-[300px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-[#e5e5e5] bg-white p-4">
          {/* Bot header */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#00A6DD]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#0a0a0a]">Enrollment Assistant</span>
            <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
              Online
            </span>
          </div>

          {/* Summary bubble */}
          <div className="rounded-2xl rounded-tl-none bg-[#f5f5f5] p-4">
            {assistantSummary ? (
              <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#4a4a4a]">{assistantSummary}</p>
            ) : (
              <p className="text-[13px] text-[#737373]">
                Your course recommendations are ready. Review and adjust them on the right.
              </p>
            )}
          </div>

          <Link
            href="/dashboard/chat"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e5e5e5] px-3 py-2 text-xs font-medium text-[#737373] transition-colors hover:bg-[#f5f5f5]"
          >
            Re-run assistant
          </Link>
        </aside>

        {/* Right — Interactive course selection (client component) */}
        <CourseSelection
          recommended={recommendedCourses}
          available={availableSections}
          semesterLabel={semesterLabel}
          registrationDate={registrationDate}
          isRegistrationOpen={isRegistrationOpen}
        />
      </div>
    </div>
  );
}
