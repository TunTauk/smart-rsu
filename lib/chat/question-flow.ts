export type ChatQuestionType = "multiple_choice" | "multi_select" | "open_ended";

export type ChatQuestionOption = {
  label: string;
  value: string;
};

export type ChatQuestion = {
  id: string;
  prompt: string;
  type: ChatQuestionType;
  options?: ChatQuestionOption[];
};

export type RecommendationAnswers = {
  subjectLoad: number;
  timePreference: string;
  preferredDays: string[];
  scheduleDensity: string;
  teachingStyle: string;
  teachingEnvironment: string;
  interestTopics: string;
  careerDirection: string;
  avoidTopics: string;
  otherConstraints: string;
};

const allDaysOptionValue = "ALL_DAYS";

export const recommendationQuestions: ChatQuestion[] = [
  {
    id: "subject_load",
    prompt: "How many subjects would you like to register for this semester?",
    type: "multiple_choice",
    options: [
      { label: "2 subjects", value: "2" },
      { label: "3 subjects", value: "3" },
      { label: "4 subjects", value: "4" },
      { label: "5 subjects", value: "5" },
      { label: "6 subjects", value: "6" },
    ],
  },
  {
    id: "time_preference",
    prompt: "Are you more of a morning person or a late-day person?",
    type: "multiple_choice",
    options: [
      { label: "Morning", value: "morning" },
      { label: "Late-day", value: "late" },
      { label: "No preference", value: "no_preference" },
    ],
  },
  {
    id: "preferred_days",
    prompt: "Which days do you want to attend classes? You can select multiple, or choose No preference to include all days.",
    type: "multi_select",
    options: [
      { label: "No preference", value: allDaysOptionValue },
      { label: "MON", value: "MONDAY" },
      { label: "TUE", value: "TUESDAY" },
      { label: "WED", value: "WEDNESDAY" },
      { label: "THU", value: "THURSDAY" },
      { label: "FRI", value: "FRIDAY" },
      { label: "SAT", value: "SATURDAY" },
    ],
  },
  {
    id: "schedule_density",
    prompt: "Do you want your schedule to be compact or spread out?",
    type: "multiple_choice",
    options: [
      { label: "Compact", value: "compact" },
      { label: "Spread out", value: "spread" },
      { label: "No preference", value: "no_preference" },
    ],
  },
  {
    id: "teaching_style",
    prompt: "Which teaching style do you usually prefer?",
    type: "multiple_choice",
    options: [
      { label: "Structured and strict", value: "structured_strict" },
      { label: "Interactive and energetic", value: "interactive_energetic" },
      { label: "Calm and supportive", value: "calm_supportive" },
      { label: "No preference", value: "no_preference" },
    ],
  },
  {
    id: "teaching_environment",
    prompt: "What kind of teaching environment helps you learn best?",
    type: "open_ended",
  },
  {
    id: "interest_topics",
    prompt: "What subjects or topics are you most interested in right now?",
    type: "open_ended",
  },
  {
    id: "career_direction",
    prompt: "What kind of career, internship, or project direction are you aiming for?",
    type: "open_ended",
  },
  {
    id: "avoid_topics",
    prompt: "Are there any courses, topics, or learning formats you want to avoid this semester?",
    type: "open_ended",
  },
  {
    id: "other_constraints",
    prompt: "Are there any other constraints I should consider, such as commute, work, or personal schedule?",
    type: "open_ended",
  },
];

export function getQuestionById(questionId: string) {
  return recommendationQuestions.find((question) => question.id === questionId) ?? null;
}

export function getNextQuestion(answerCount: number) {
  return recommendationQuestions[answerCount] ?? null;
}

export function getAnswerMessages<T extends { role: string; content: string }>(messages: T[]) {
  return messages.filter((message) => message.role === "USER");
}

function parseStoredOptionValues(question: ChatQuestion, rawValue: string) {
  const values = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!question.options) {
    return values;
  }

  return values.map((value) => {
    const matchedOption = question.options?.find((option) => option.label === value || option.value === value);

    return matchedOption?.value ?? value;
  });
}

export function formatStoredAnswer(question: ChatQuestion, rawValue: string) {
  if (question.type === "open_ended") {
    return rawValue.trim();
  }

  const values = rawValue
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);

  if (question.type === "multi_select") {
    const labels = values.map(
      (value) => question.options?.find((option) => option.value === value)?.label ?? value,
    );

    return labels.join(", ");
  }

  return question.options?.find((option) => option.value === rawValue)?.label ?? rawValue;
}

export function parseRecommendationAnswers<T extends { role: string; content: string }>(messages: T[]) {
  const answers = getAnswerMessages(messages).slice(0, recommendationQuestions.length);

  if (answers.length < recommendationQuestions.length) {
    return null;
  }

  const subjectLoadValues = parseStoredOptionValues(recommendationQuestions[0], answers[0].content);
  const timePreferenceValues = parseStoredOptionValues(recommendationQuestions[1], answers[1].content);
  const preferredDayValues = parseStoredOptionValues(recommendationQuestions[2], answers[2].content);
  const scheduleDensityValues = parseStoredOptionValues(recommendationQuestions[3], answers[3].content);
  const teachingStyleValues = parseStoredOptionValues(recommendationQuestions[4], answers[4].content);
  const normalizedPreferredDays = preferredDayValues.includes(allDaysOptionValue) ? [] : preferredDayValues;

  return {
    subjectLoad: Number.parseInt(subjectLoadValues[0] ?? answers[0].content, 10) || 4,
    timePreference: timePreferenceValues[0] ?? answers[1].content,
    preferredDays: normalizedPreferredDays,
    scheduleDensity: scheduleDensityValues[0] ?? answers[3].content,
    teachingStyle: teachingStyleValues[0] ?? answers[4].content,
    teachingEnvironment: answers[5].content,
    interestTopics: answers[6].content,
    careerDirection: answers[7].content,
    avoidTopics: answers[8].content,
    otherConstraints: answers[9].content,
  } satisfies RecommendationAnswers;
}
