import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, Mail, Hash, TrendingUp } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";

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

const gradeColor: Record<string, string> = {
  A: "text-[#16A34A]",
  "B+": "text-[#16A34A]",
  B: "text-[#00A6DD]",
  "C+": "text-[#00A6DD]",
  C: "text-[#A89A6F]",
  "D+": "text-[#A89A6F]",
  D: "text-[#F97316]",
  F: "text-[#DC0963]",
  W: "text-[#737373]",
  S: "text-[#16A34A]",
  U: "text-[#DC0963]",
};

const courseTypePill: Record<string, string> = {
  "Major Core": "bg-[#A89A6F]/10 text-[#A89A6F]",
  "Major Electives": "bg-[#00A6DD]/10 text-[#00A6DD]",
  "General Educations": "bg-[#16A34A]/10 text-[#16A34A]",
  "Free Elective": "bg-[#DC0963]/10 text-[#DC0963]",
};

export default async function ProfilePage() {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    redirect("/");
  }

  const studentId = user.student.id;

  const courseHistories = await prisma.student_course_histories.findMany({
    where: { student_id: studentId },
    include: {
      subject: {
        select: { code: true, name: true, type: true, credit: true },
      },
    },
    orderBy: [{ semester_year: "desc" }, { semester_no: "desc" }, { id: "asc" }],
  });

  // Stats
  let qualityPoints = 0;
  let gradedCredits = 0;
  let earnedCredits = 0;

  for (const entry of courseHistories) {
    earnedCredits += entry.credit_earned;
    const pts = gradePoints[entry.grade.toUpperCase()];
    if (typeof pts === "number") {
      qualityPoints += pts * entry.credit_earned;
      gradedCredits += entry.credit_earned;
    }
  }

  const gpa = gradedCredits > 0 ? (qualityPoints / gradedCredits).toFixed(2) : "-";
  const completedSubjects = new Set(courseHistories.map((h) => h.subject_id)).size;

  // Group histories by semester
  type HistoryEntry = (typeof courseHistories)[number];
  const semesterMap = new Map<string, HistoryEntry[]>();

  for (const entry of courseHistories) {
    const key =
      entry.semester_year != null && entry.semester_no != null
        ? `${entry.semester_year}-${entry.semester_no}`
        : "unknown";
    if (!semesterMap.has(key)) semesterMap.set(key, []);
    semesterMap.get(key)!.push(entry);
  }

  const avatarLetter = user.student.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="flex h-full w-full flex-col bg-[#f9fafb]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-[#e5e5e5] bg-white px-6">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Profile</h1>
      </header>

      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        {/* ── Identity card ── */}
        <div className="flex items-center gap-5 rounded-xl border border-[#e5e5e5] bg-white p-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#00A6DD] text-2xl font-bold text-white">
            {avatarLetter}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="text-lg font-bold text-[#0a0a0a]">{user.student.name}</h2>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#737373]">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {user.student.rsu_id}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                {user.student.major?.name ?? "—"}
                {user.student.major?.code && (
                  <span className="rounded-full bg-[#A89A6F]/10 px-2 py-0.5 text-[11px] font-medium text-[#A89A6F]">
                    {user.student.major.code}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex items-center gap-2 text-[#737373]">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Credits Earned</span>
            </div>
            <span className="mt-2 text-2xl font-bold text-[#A89A6F]">{earnedCredits}</span>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex items-center gap-2 text-[#737373]">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs">Subjects Completed</span>
            </div>
            <span className="mt-2 text-2xl font-bold text-[#00A6DD]">{completedSubjects}</span>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex items-center gap-2 text-[#737373]">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Cumulative GPA</span>
            </div>
            <span className="mt-2 text-2xl font-bold text-[#16A34A]">{gpa}</span>
          </div>
        </div>

        {/* ── Course History ── */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white">
          <div className="border-b border-[#f0f0f0] px-5 py-4">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Course History</h2>
            <p className="mt-0.5 text-xs text-[#737373]">{courseHistories.length} records</p>
          </div>

          {courseHistories.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#737373]">No course history found.</div>
          ) : (
            <div className="divide-y divide-[#f5f5f5]">
              {Array.from(semesterMap.entries()).map(([key, entries]) => {
                const first = entries[0];
                const semLabel =
                  first.semester_year != null && first.semester_no != null
                    ? `Semester ${first.semester_no} / ${first.semester_year}`
                    : "Unassigned";

                return (
                  <div key={key}>
                    <div className="bg-[#f9fafb] px-5 py-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
                        {semLabel}
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-[#f5f5f5]">
                        {entries.map((entry) => {
                          const typePill = courseTypePill[entry.subject.type] ?? "bg-[#f5f5f5] text-[#737373]";
                          const gradeClass = gradeColor[entry.grade.toUpperCase()] ?? "text-[#0a0a0a]";

                          return (
                            <tr key={entry.id} className="hover:bg-[#fafafa]">
                              <td className="w-28 px-5 py-3">
                                <span className="font-mono text-xs font-semibold text-[#00A6DD]">
                                  {entry.subject.code}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-[#0a0a0a]">{entry.subject.name}</div>
                                <span
                                  className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${typePill}`}
                                >
                                  {entry.subject.type}
                                </span>
                              </td>
                              <td className="w-12 px-4 py-3 text-center text-xs text-[#737373]">
                                {entry.credit_earned} cr
                              </td>
                              <td className="w-14 px-5 py-3 text-center">
                                <span className={`text-sm font-bold ${gradeClass}`}>{entry.grade}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
