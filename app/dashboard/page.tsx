import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";

const subjectTypes = [
  { label: "Major Core", color: "#A89A6F" },
  { label: "Major Electives", color: "#00A6DD" },
  { label: "General Educations", color: "#16A34A" },
  { label: "Free Elective", color: "#DC0963" },
] as const;

const gradePoints: Record<string, number> = {
  A: 4,
  "B+": 3.5,
  B: 3,
  "C+": 2.5,
  C: 2,
  "D+": 1.5,
  D: 1,
  F: 0,
};

const dayNames = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
} as const;

const dayShortNames = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
} as const;

const dayOrder = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

function estimateGraduationYear(
  currentSemesterNo: number | null,
  currentSemesterYear: number | null,
  remainingCredits: number,
  averageCreditsPerSemester: number,
) {
  if (!currentSemesterNo || !currentSemesterYear || averageCreditsPerSemester <= 0) {
    return "-";
  }

  if (remainingCredits <= 0) {
    return String(currentSemesterYear);
  }

  const additionalSemesters = Math.ceil(remainingCredits / averageCreditsPerSemester);
  const finalSemesterIndex = currentSemesterNo + additionalSemesters - 1;
  const finalYear = currentSemesterYear + Math.floor((finalSemesterIndex - 1) / 2);

  return String(finalYear);
}

export default async function DashboardPage() {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    redirect("/");
  }

  const studentId = user.student.id;
  const majorId = user.student.major?.code
    ? (
        await prisma.students.findUnique({
          where: { id: studentId },
          select: { major_id: true },
        })
      )?.major_id
    : null;

  if (!majorId) {
    redirect("/");
  }

  const [majorSubjects, courseHistories, currentEnrollment] = await Promise.all([
    prisma.major_subjects.findMany({
      where: { major_id: majorId },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            credit: true,
          },
        },
      },
    }),
    prisma.student_course_histories.findMany({
      where: { student_id: studentId },
      include: {
        subject: {
          select: {
            id: true,
            type: true,
            credit: true,
          },
        },
      },
      orderBy: [{ semester_year: "asc" }, { semester_no: "asc" }],
    }),
    prisma.student_current_enrollments.findFirst({
      where: { student_id: studentId },
      include: {
        semester_schedule: {
          select: {
            semester_no: true,
            semester_year: true,
          },
        },
        current_courses: {
          include: {
            subject: {
              select: {
                credit: true,
              },
            },
          },
          orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
        },
      },
      orderBy: { updated_at: "desc" },
    }),
  ]);

  const requiredCredits = majorSubjects.reduce((sum, entry) => sum + entry.subject.credit, 0);
  const earnedCredits = courseHistories.reduce((sum, entry) => sum + entry.credit_earned, 0);
  const completedSubjectIds = new Set(courseHistories.map((entry) => entry.subject_id));
  const completedSubjectsCount = completedSubjectIds.size;

  let qualityPoints = 0;
  let gradedCredits = 0;

  for (const entry of courseHistories) {
    const points = gradePoints[entry.grade.toUpperCase()];

    if (typeof points !== "number") {
      continue;
    }

    qualityPoints += points * entry.credit_earned;
    gradedCredits += entry.credit_earned;
  }

  const cumulativeGpa = gradedCredits > 0 ? (qualityPoints / gradedCredits).toFixed(2) : "-";
  const overallPercent = requiredCredits > 0 ? (earnedCredits / requiredCredits) * 100 : 0;

  const progressByType = subjectTypes.map((type) => {
    const requiredSubjects = majorSubjects.filter((entry) => entry.subject.type === type.label);
    const completedSubjects = requiredSubjects.filter((entry) => completedSubjectIds.has(entry.subject.id));
    const percent = requiredSubjects.length > 0 ? (completedSubjects.length / requiredSubjects.length) * 100 : 0;

    return {
      ...type,
      percent,
    };
  });

  const semesterCredits = new Map();

  for (const entry of courseHistories) {
    if (entry.semester_year == null || entry.semester_no == null) {
      continue;
    }

    const semesterKey = `${entry.semester_year}-${entry.semester_no}`;
    semesterCredits.set(semesterKey, (semesterCredits.get(semesterKey) ?? 0) + entry.credit_earned);
  }

  const averageCreditsPerSemester =
    semesterCredits.size > 0
      ? Array.from(semesterCredits.values()).reduce((sum, value) => sum + value, 0) / semesterCredits.size
      : 0;

  const estimatedGraduationYear = estimateGraduationYear(
    currentEnrollment?.semester_schedule?.semester_no ?? null,
    currentEnrollment?.semester_schedule?.semester_year ?? null,
    Math.max(requiredCredits - earnedCredits, 0),
    averageCreditsPerSemester,
  );

  const enrolledCourses = [...(currentEnrollment?.current_courses ?? [])].sort((left, right) => {
    const dayDifference = dayOrder[left.day_of_week] - dayOrder[right.day_of_week];

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return left.start_time.localeCompare(right.start_time);
  });

  const semesterLabel = currentEnrollment?.semester_schedule
    ? `Semester ${currentEnrollment.semester_schedule.semester_no} / ${currentEnrollment.semester_schedule.semester_year}`
    : "No active semester";

  return (
    <div className="flex h-full w-full flex-col bg-[#f9fafb] font-sans">
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 flex-row items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Dashboard</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[#A89A6F]/10 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#A89A6F]" />
            <span className="text-[11px] font-semibold text-[#A89A6F]">{semesterLabel}</span>
          </div>

          <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-[#f5f5f5]">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex w-full flex-col gap-4 overflow-y-auto p-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#A89A6F]">
              {earnedCredits} / {requiredCredits}
            </span>
            <span className="mt-1 text-xs text-[#737373]">Credits Earned</span>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#00A6DD]">{completedSubjectsCount}</span>
            <span className="mt-1 text-xs text-[#737373]">Subjects Completed</span>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#16A34A]">{cumulativeGpa}</span>
            <span className="mt-1 text-xs text-[#737373]">Cumulative GPA</span>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <span className="text-[26px] font-bold text-[#DC0963]">{estimatedGraduationYear}</span>
            <span className="mt-1 text-xs text-[#737373]">Est. Graduation</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Degree Progress</h2>
            <span className="text-sm font-semibold text-[#00A6DD]">{formatPercent(overallPercent)} Complete</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full bg-[#00A6DD]" style={{ width: `${Math.min(overallPercent, 100)}%` }} />
          </div>

          <div className="mt-2 flex flex-col gap-2">
            {progressByType.map((item) => (
              <div className="flex items-center gap-3" key={item.label}>
                <span className="w-32 text-xs text-[#737373]">{item.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(item.percent, 100)}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] text-[#737373]">{Math.round(item.percent)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Currently Enrolled</h2>

            {enrolledCourses.length === 0 ? (
              <p className="text-sm text-[#737373]">No current enrolled courses found.</p>
            ) : (
              <div className="flex flex-col w-full text-left">
                <div className="flex gap-2 border-b border-[#e5e5e5] py-2 align-middle">
                  <span className="w-[88px] text-[11px] font-medium tracking-wide text-[#737373]">CODE</span>
                  <span className="flex-1 text-[11px] font-medium tracking-wide text-[#737373]">SUBJECT NAME</span>
                  <span className="w-10 text-[11px] font-medium tracking-wide text-[#737373]">CR</span>
                  <span className="w-40 text-[11px] font-medium tracking-wide text-[#737373]">SCHEDULE</span>
                  <span className="w-[90px] text-[11px] font-medium tracking-wide text-[#737373]">ROOM</span>
                </div>

                {enrolledCourses.map((course) => (
                  <div className="flex gap-2 border-b border-[#f0f0f0] py-2.5 items-center" key={course.id}>
                    <span className="w-[88px] text-[13px] text-[#0a0a0a]">{course.subject_code}</span>
                    <div className="flex-1">
                      <div className="line-clamp-1 text-[13px] text-[#0a0a0a]">{course.subject_name}</div>
                      {course.lecture_section ? (
                        <div className="text-[11px] text-[#737373]">Lecture: {course.lecture_section}</div>
                      ) : null}
                    </div>
                    <span className="w-10 text-[13px] text-[#737373]">{course.subject?.credit ?? "-"}</span>
                    <div className="w-40 text-xs text-[#737373]">
                      <div>{dayShortNames[course.day_of_week]}</div>
                      <div>{formatTimeRange(course.start_time, course.end_time)}</div>
                    </div>
                    <span className="w-[90px] text-xs text-[#737373]">{course.room ?? "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full flex-shrink-0 flex-col items-center justify-center gap-4 rounded-xl border border-[#00A6DD]/20 bg-[#00A6DD]/[0.05] p-6 text-center lg:w-[280px]">
            <Sparkles className="h-9 w-9 text-[#00A6DD]" />
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[15px] font-bold leading-tight text-[#0a0a0a]">Plan Your Next Semester</h3>
              <p className="text-xs leading-relaxed text-[#737373]">
                Chat with the AI assistant to get personalized course recommendations
              </p>
            </div>

            <Link
              href="/dashboard/chat"
              className="mt-1 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              Start Planning &rarr;
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5">
          <h2 className="mb-3 text-[15px] font-semibold text-[#0a0a0a]">Current Timetable Snapshot</h2>
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-[#737373]">No timetable data available.</p>
          ) : (
            <div className="space-y-4 text-[#0a0a0a]">
              {enrolledCourses.map((course) => (
                <div key={`snapshot-${course.id}`}>
                  <h3 className="text-[15px] font-bold uppercase">
                    {course.subject_code} : {course.subject_name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-[13px] font-semibold">
                    <span>Lecture : {course.lecture_section ?? "-"}</span>
                    <span>Room : {course.room ?? "-"}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-[#737373]">Day : {dayNames[course.day_of_week]}</p>
                  <p className="text-[13px] text-[#737373]">Time : {formatTimeRange(course.start_time, course.end_time)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
