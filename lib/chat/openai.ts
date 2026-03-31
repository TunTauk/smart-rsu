import OpenAI from "openai";
import type { RecommendationAnswers } from "@/lib/chat/question-flow";
import type {
  RecommendationCandidate,
  RecommendedCourse,
  StudentChatSummary,
} from "@/lib/chat/recommendation-engine";

type OpenAIRecommendationSelection = {
  selected: Array<{
    subjectCode: string;
    semesterSubjectId: number;
    semesterSectionId: number;
    reason?: string;
  }>;
  summary?: string;
};

function buildFallbackResponse(summary: StudentChatSummary, recommendations: RecommendedCourse[]) {
  if (recommendations.length === 0) {
    return [
      `You currently have ${summary.earnedCredits} earned credits with a GPA of ${summary.cumulativeGpa}.`,
      "I could not find any conflict-free recommendations from the current semester offerings after checking your completed courses, current schedule, and prerequisite rules.",
      "Try adjusting your preferred days, changing the number of subjects, or expanding your schedule preference.",
    ].join("\n\n");
  }

  const lines = recommendations.map((course, index) => {
    const firstMeeting = course.meetings[0];
    const schedule = firstMeeting
      ? `${firstMeeting.day_of_week} ${firstMeeting.start_time}-${firstMeeting.end_time}`
      : "schedule to be confirmed";

    return `${index + 1}. ${course.subjectCode} ${course.subjectName} (section ${course.sectionCode}, ${schedule})`;
  });

  return [
    `Based on your profile, current enrollment, and academic progress, I prepared ${recommendations.length} recommendation${recommendations.length > 1 ? "s" : ""}.`,
    lines.join("\n"),
    "These options were filtered to avoid conflicts with your current timetable and to prioritize eligible courses.",
  ].join("\n\n");
}

export async function createRecommendationResponse(
  summary: StudentChatSummary,
  answers: RecommendationAnswers,
  recommendations: RecommendedCourse[],
  followUpNote?: string,
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackResponse(summary, recommendations);
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const recommendationLines = recommendations.length
    ? recommendations
        .map((course, index) => {
          const meetings = course.meetings
            .map((meeting) => `${meeting.day_of_week} ${meeting.start_time}-${meeting.end_time}`)
            .join(", ");

          return `${index + 1}. ${course.subjectCode} - ${course.subjectName} | type=${course.subjectType} | credits=${course.credit} | section=${course.sectionCode} | room=${course.room ?? "-"} | meetings=${meetings} | reasons=${course.reasons.join("; ") || "eligible fit"}`;
        })
        .join("\n")
    : "No valid recommendations found.";

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are Smart RSU, a degree audit and enrollment assistant for Rangsit University. Explain only the provided recommendations. Do not invent courses, sections, credits, or prerequisites. Keep the tone concise, practical, and student-friendly.",
      },
      {
        role: "user",
        content: [
          `Student summary: ${summary.studentName}, earned credits ${summary.earnedCredits}, GPA ${summary.cumulativeGpa}, estimated graduation year ${summary.estimatedGraduationYear}.`,
          `Preferences: ${JSON.stringify(answers)}.`,
          followUpNote ? `Latest follow-up note from student: ${followUpNote}` : "",
          `Recommendations:\n${recommendationLines}`,
          "Write a short response with: 1) one sentence summary, 2) a bullet list of recommended courses with why each fits, 3) one short warning if the list is limited or has tradeoffs.",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || buildFallbackResponse(summary, recommendations);
}

export async function selectRecommendationsWithOpenAI(
  summary: StudentChatSummary,
  answers: RecommendationAnswers,
  candidates: RecommendationCandidate[],
  targetCount: number,
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || candidates.length === 0) {
    return null;
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const candidateLines = candidates.map((candidate) => ({
    subjectCode: candidate.subjectCode,
    subjectName: candidate.subjectName,
    description: candidate.subjectDescription,
    subjectType: candidate.subjectType,
    credit: candidate.credit,
    semesterSubjectId: candidate.semesterSubjectId,
    semesterSectionId: candidate.semesterSectionId,
    sectionCode: candidate.sectionCode,
    room: candidate.room,
    meetings: candidate.meetings.map(
      (meeting) => `${meeting.day_of_week} ${meeting.start_time}-${meeting.end_time}`,
    ),
  }));

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are Smart RSU, a course recommendation assistant. Choose courses only from the provided candidate list. Never invent subject codes, section ids, or semester subject ids. Return valid JSON only.",
      },
      {
        role: "user",
        content: [
          `Student summary: ${summary.studentName}, earned credits ${summary.earnedCredits}, GPA ${summary.cumulativeGpa}, estimated graduation year ${summary.estimatedGraduationYear}, current semester ${summary.currentSemesterLabel}.`,
          `Student preferences: ${JSON.stringify(answers)}.`,
          `Select exactly ${targetCount} course(s) from the candidate list. Rank candidates by preference fit (preferred days, time of day, teaching style, interest topics, career direction), but always return exactly ${targetCount} selections — include lower-match courses to fill the count if needed. Use the course description when judging topic fit, career alignment, and topics to avoid.`,
          `Candidates: ${JSON.stringify(candidateLines)}.`,
          "Return JSON with this shape: {\"selected\":[{\"subjectCode\":\"...\",\"semesterSubjectId\":123,\"semesterSectionId\":456,\"reason\":\"...\"}],\"summary\":\"...\"}. Keep reasons brief.",
        ].join("\n\n"),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as OpenAIRecommendationSelection;

    if (!Array.isArray(parsed.selected)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
