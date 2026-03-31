import { prisma } from "@/lib/prisma";
import type { RecommendationAnswers } from "@/lib/chat/question-flow";

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

const dayOrder = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

type CourseMeeting = {
  day_of_week: keyof typeof dayOrder;
  start_time: string;
  end_time: string;
};

export type StudentChatSummary = {
  studentName: string;
  currentRegisteredSubjects: number;
  earnedCredits: number;
  cumulativeGpa: string;
  estimatedGraduationYear: string;
  currentSemesterLabel: string;
};

export type RecommendedCourse = {
  semesterSubjectId: number;
  semesterSectionId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  subjectDescription: string;
  subjectType: string;
  credit: number;
  sectionCode: string;
  room: string | null;
  meetings: CourseMeeting[];
  score: number;
  reasons: string[];
};

export type RecommendationCandidate = {
  semesterSubjectId: number;
  semesterSectionId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  subjectDescription: string;
  subjectType: string;
  credit: number;
  sectionCode: string;
  room: string | null;
  meetings: CourseMeeting[];
};

export async function getStudentRecommendationContext(studentId: number) {
  const student = await prisma.students.findUnique({
    where: { id: studentId },
    include: {
      major: true,
      course_histories: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  const currentEnrollment = await prisma.student_current_enrollments.findFirst({
    where: { student_id: studentId },
    include: {
      semester_schedule: true,
      current_courses: true,
    },
    orderBy: { updated_at: "desc" },
  });

  const activeSemesterSchedule =
    currentEnrollment?.semester_schedule ??
    (await prisma.semester_schedules.findFirst({
      where: { major_id: student.major_id },
      orderBy: [{ semester_year: "desc" }, { semester_no: "desc" }],
    }));

  if (!activeSemesterSchedule) {
    throw new Error("No semester schedule available for this student.");
  }

  const [majorSubjects, semesterSubjects] = await Promise.all([
    prisma.major_subjects.findMany({
      where: { major_id: student.major_id },
      include: { subject: true },
    }),
    prisma.semester_subjects.findMany({
      where: { semester_schedule_id: activeSemesterSchedule.id },
      include: {
        subject: true,
        sections: {
          include: {
            meetings: true,
          },
        },
      },
    }),
  ]);

  return {
    student,
    currentEnrollment,
    activeSemesterSchedule,
    majorSubjects,
    semesterSubjects,
  };
}

export function buildStudentSummary(context: Awaited<ReturnType<typeof getStudentRecommendationContext>>): StudentChatSummary {
  const earnedCredits = context.student.course_histories.reduce((sum: number, item) => sum + item.credit_earned, 0);
  const semesterCredits = new Map<string, number>();
  let qualityPoints = 0;
  let gradedCredits = 0;

  for (const item of context.student.course_histories) {
    if (item.semester_year != null && item.semester_no != null) {
      const key = `${item.semester_year}-${item.semester_no}`;
      semesterCredits.set(key, (semesterCredits.get(key) ?? 0) + item.credit_earned);
    }

    const points = gradePoints[item.grade.toUpperCase()];

    if (typeof points === "number") {
      qualityPoints += points * item.credit_earned;
      gradedCredits += item.credit_earned;
    }
  }

  const totalRequiredCredits = context.majorSubjects.reduce(
    (sum: number, item) => sum + item.subject.credit,
    0,
  );
  const averageCreditsPerSemester =
    semesterCredits.size > 0
      ? Array.from(semesterCredits.values()).reduce((sum: number, value) => sum + value, 0) / semesterCredits.size
      : 0;
  const remainingCredits = Math.max(totalRequiredCredits - earnedCredits, 0);

  let estimatedGraduationYear = "-";

  if (averageCreditsPerSemester > 0) {
    const additionalSemesters = Math.ceil(remainingCredits / averageCreditsPerSemester);
    const semesterIndex = context.activeSemesterSchedule.semester_no + additionalSemesters - 1;
    estimatedGraduationYear = String(
      context.activeSemesterSchedule.semester_year + Math.floor((semesterIndex - 1) / 2),
    );
  }

  return {
    studentName: context.student.name,
    currentRegisteredSubjects: context.currentEnrollment?.current_courses.length ?? 0,
    earnedCredits,
    cumulativeGpa: gradedCredits > 0 ? (qualityPoints / gradedCredits).toFixed(2) : "-",
    estimatedGraduationYear,
    currentSemesterLabel: `Semester ${context.activeSemesterSchedule.semester_no} / ${context.activeSemesterSchedule.semester_year}`,
  };
}

function overlaps(left: CourseMeeting, right: CourseMeeting) {
  if (left.day_of_week !== right.day_of_week) {
    return false;
  }

  return left.start_time < right.end_time && right.start_time < left.end_time;
}

function subjectMatchesKeywords(subjectName: string, text: string) {
  const normalized = text.toLowerCase();

  return subjectName
    .toLowerCase()
    .split(/\s+/)
    .some((part) => part.length > 3 && normalized.includes(part));
}

function getCandidatePool(context: Awaited<ReturnType<typeof getStudentRecommendationContext>>) {
  const completedSubjectIds = new Set(context.student.course_histories.map((item) => item.subject_id));
  const currentSubjectIds = new Set(
    (context.currentEnrollment?.current_courses ?? [])
      .map((item: { subject_id: number | null }) => item.subject_id)
      .filter((value: number | null): value is number => value != null),
  );
  const currentMeetings: CourseMeeting[] = (context.currentEnrollment?.current_courses ?? []).map((item: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }) => ({
    day_of_week: item.day_of_week as keyof typeof dayOrder,
    start_time: item.start_time,
    end_time: item.end_time,
  }));

  return { completedSubjectIds, currentSubjectIds, currentMeetings };
}

export function getEligibleRecommendationCandidates(
  context: Awaited<ReturnType<typeof getStudentRecommendationContext>>,
) {
  const { completedSubjectIds, currentSubjectIds, currentMeetings } = getCandidatePool(context);
  const candidates: RecommendationCandidate[] = [];

  for (const semesterSubject of context.semesterSubjects) {
    if (completedSubjectIds.has(semesterSubject.subject_id) || currentSubjectIds.has(semesterSubject.subject_id)) {
      continue;
    }

    if (
      semesterSubject.subject.prerequisite_id != null &&
      !completedSubjectIds.has(semesterSubject.subject.prerequisite_id)
    ) {
      continue;
    }

    for (const section of semesterSubject.sections) {
      if (section.meetings.some((meeting) => currentMeetings.some((current) => overlaps(meeting, current)))) {
        continue;
      }

      candidates.push({
        semesterSubjectId: semesterSubject.id,
        semesterSectionId: section.id,
        subjectId: semesterSubject.subject_id,
        subjectCode: semesterSubject.subject.code,
        subjectName: semesterSubject.subject.name,
        subjectDescription: semesterSubject.subject.description ?? "",
        subjectType: semesterSubject.subject.type,
        credit: semesterSubject.subject.credit,
        sectionCode: section.code,
        room: (section.meetings[0] as { room?: string | null } | undefined)?.room ?? null,
        meetings: section.meetings.map((meeting) => ({
          day_of_week: meeting.day_of_week as keyof typeof dayOrder,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
        })),
      });
    }
  }

  return candidates;
}

function scoreCandidate(
  candidate: RecommendationCandidate,
  answers: RecommendationAnswers,
  occupiedDays: Set<keyof typeof dayOrder>,
  preferredDays: Set<string>,
) {
  let score = 0;
  const reasons: string[] = [];
  const sectionDays = new Set(candidate.meetings.map((meeting) => meeting.day_of_week));

  if (candidate.subjectType === "Major Core") {
    score += 5;
    reasons.push("keeps you moving on major core requirements");
  } else if (candidate.subjectType === "Major Electives") {
    score += 3;
  } else {
    score += 1;
  }

  if (preferredDays.size > 0) {
    const matchedPreferredDays = [...sectionDays].filter((day) => preferredDays.has(day)).length;
    score += matchedPreferredDays * 2;

    if (matchedPreferredDays > 0) {
      reasons.push("matches your preferred class days");
    }
  }

  const morningMeetings = candidate.meetings.filter((meeting) => meeting.start_time < "12:00").length;
  const lateMeetings = candidate.meetings.length - morningMeetings;

  if (answers.timePreference === "morning" && morningMeetings >= lateMeetings) {
    score += 2;
    reasons.push("fits your morning preference");
  }

  if (answers.timePreference === "late" && lateMeetings > morningMeetings) {
    score += 2;
    reasons.push("fits your late-day preference");
  }

  if (answers.scheduleDensity === "compact") {
    const sharedDays = [...sectionDays].filter((day) => occupiedDays.has(day)).length;
    score += sharedDays;

    if (sharedDays > 0) {
      reasons.push("helps keep your schedule on fewer days");
    }
  }

  if (answers.scheduleDensity === "spread") {
    const newDays = [...sectionDays].filter((day) => !occupiedDays.has(day)).length;
    score += newDays;

    if (newDays > 0) {
      reasons.push("spreads your classes across the week");
    }
  }

  if (
    subjectMatchesKeywords(candidate.subjectName, answers.interestTopics) ||
    subjectMatchesKeywords(candidate.subjectName, answers.careerDirection) ||
    subjectMatchesKeywords(candidate.subjectDescription, answers.interestTopics) ||
    subjectMatchesKeywords(candidate.subjectDescription, answers.careerDirection)
  ) {
    score += 3;
    reasons.push("aligns with the topics you said you are interested in");
  }

  if (
    answers.avoidTopics &&
    (subjectMatchesKeywords(candidate.subjectName, answers.avoidTopics) ||
      subjectMatchesKeywords(candidate.subjectDescription, answers.avoidTopics))
  ) {
    score -= 4;
  }

  return { score, reasons };
}

export function validateRecommendedCourses(
  context: Awaited<ReturnType<typeof getStudentRecommendationContext>>,
  candidates: RecommendationCandidate[],
  selected: Array<Pick<RecommendedCourse, "semesterSubjectId" | "semesterSectionId" | "subjectCode"> & { reason?: string }>,
  targetCount: number,
) {
  const candidateMap = new Map(
    candidates.map((candidate) => [
      `${candidate.semesterSubjectId}:${candidate.semesterSectionId}`,
      candidate,
    ]),
  );
  const usedSubjects = new Set<number>();
  const usedSections = new Set<number>();
  const { currentMeetings } = getCandidatePool(context);
  const selectedMeetings: CourseMeeting[] = [...currentMeetings];
  const validated: RecommendedCourse[] = [];

  for (const item of selected.slice(0, targetCount)) {
    const candidate = candidateMap.get(`${item.semesterSubjectId}:${item.semesterSectionId}`);

    if (!candidate || candidate.subjectCode !== item.subjectCode) {
      continue;
    }

    if (usedSubjects.has(candidate.subjectId) || usedSections.has(candidate.semesterSectionId)) {
      continue;
    }

    if (candidate.meetings.some((meeting) => selectedMeetings.some((current) => overlaps(meeting, current)))) {
      continue;
    }

    validated.push({
      ...candidate,
      score: 0,
      reasons: item.reason ? [item.reason] : [],
    });
    usedSubjects.add(candidate.subjectId);
    usedSections.add(candidate.semesterSectionId);
    selectedMeetings.push(...candidate.meetings);
  }

  return validated;
}

export function generateFallbackRecommendations(
  context: Awaited<ReturnType<typeof getStudentRecommendationContext>>,
  answers: RecommendationAnswers,
  candidates = getEligibleRecommendationCandidates(context),
  targetCountOverride?: number,
) {
  const currentMeetings: CourseMeeting[] = (context.currentEnrollment?.current_courses ?? []).map((item: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }) => ({
    day_of_week: item.day_of_week as keyof typeof dayOrder,
    start_time: item.start_time,
    end_time: item.end_time,
  }));
  const preferredDays = new Set(answers.preferredDays);
  const occupiedDays = new Set(currentMeetings.map((meeting) => meeting.day_of_week));
  const targetCount = targetCountOverride ?? Math.max(answers.subjectLoad, 1);

  const rankedCandidates = candidates
    .map((candidate) => {
      const { score, reasons } = scoreCandidate(candidate, answers, occupiedDays, preferredDays);

      return {
        ...candidate,
        score,
        reasons,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const leftDay = left.meetings[0] ? dayOrder[left.meetings[0].day_of_week] : 99;
      const rightDay = right.meetings[0] ? dayOrder[right.meetings[0].day_of_week] : 99;

      return leftDay - rightDay;
    });

  const selected: RecommendedCourse[] = [];
  const selectedMeetings: CourseMeeting[] = [...currentMeetings];
  const selectedSubjects = new Set<number>();

  for (const candidate of rankedCandidates) {
    if (selectedSubjects.has(candidate.subjectId)) {
      continue;
    }

    const conflicts = candidate.meetings.some((meeting) => selectedMeetings.some((current) => overlaps(meeting, current)));

    if (conflicts) {
      continue;
    }

    selected.push(candidate);
    selectedSubjects.add(candidate.subjectId);
    selectedMeetings.push(...candidate.meetings);

    if (selected.length >= targetCount) {
      break;
    }
  }

  return selected;
}

export function generateRecommendations(
  context: Awaited<ReturnType<typeof getStudentRecommendationContext>>,
  answers: RecommendationAnswers,
) {
  return generateFallbackRecommendations(context, answers);
}
