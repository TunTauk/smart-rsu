"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";
import {
  formatStoredAnswer,
  getAnswerMessages,
  getNextQuestion,
  parseRecommendationAnswers,
  recommendationQuestions,
} from "@/lib/chat/question-flow";
import { createRecommendationResponse, selectRecommendationsWithOpenAI } from "@/lib/chat/openai";
import {
  buildStudentSummary,
  generateFallbackRecommendations,
  getEligibleRecommendationCandidates,
  getStudentRecommendationContext,
  validateRecommendedCourses,
} from "@/lib/chat/recommendation-engine";
import { getOrCreateConversation } from "@/lib/chat/conversations";

export async function submitChatAnswer(formData: FormData) {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    throw new Error("Student session is required.");
  }

  const student = user.student;

  const conversation = await getOrCreateConversation(student.id);
  const questionId = String(formData.get("questionId") ?? "");
  const rawAnswer = String(formData.get("answer") ?? "").trim();

  if (!rawAnswer) {
    return;
  }

  const existingMessages = await prisma.recommendation_messages.findMany({
    where: { conversation_id: conversation.id },
    orderBy: { created_at: "asc" },
  });
  const answeredCount = Math.min(getAnswerMessages(existingMessages).length, recommendationQuestions.length);
  const currentQuestion = getNextQuestion(answeredCount);
  const isFollowUp = currentQuestion == null;

  if (!isFollowUp && currentQuestion.id !== questionId) {
    throw new Error("Question flow is out of sync. Please refresh the page.");
  }

  const storedAnswer = isFollowUp ? rawAnswer : formatStoredAnswer(currentQuestion, rawAnswer);

  await prisma.recommendation_messages.create({
    data: {
      conversation_id: conversation.id,
      role: "USER",
      content: storedAnswer,
    },
  });

  const updatedMessages = await prisma.recommendation_messages.findMany({
    where: { conversation_id: conversation.id },
    orderBy: { created_at: "asc" },
  });
  const nextAnswerCount = Math.min(getAnswerMessages(updatedMessages).length, recommendationQuestions.length);
  const nextQuestion = getNextQuestion(nextAnswerCount);

  if (nextQuestion) {
    await prisma.recommendation_messages.create({
      data: {
        conversation_id: conversation.id,
        role: "ASSISTANT",
        content: nextQuestion.prompt,
      },
    });

    revalidatePath("/dashboard/chat");
    return;
  }

  const answers = parseRecommendationAnswers(updatedMessages);

  if (!answers) {
    revalidatePath("/dashboard/chat");
    return;
  }

  const context = await getStudentRecommendationContext(student.id);
  const summary = buildStudentSummary(context);
  const candidatePool = getEligibleRecommendationCandidates(context);
  const targetCount = Math.max(answers.subjectLoad, 1);
  const openAISelection = await selectRecommendationsWithOpenAI(summary, answers, candidatePool, targetCount);
  const validatedRecommendations = openAISelection
    ? validateRecommendedCourses(context, candidatePool, openAISelection.selected, targetCount)
    : [];

  // Fill remaining slots without discarding good OpenAI picks
  let finalRecommendations = validatedRecommendations;
  if (finalRecommendations.length < targetCount && candidatePool.length > 0) {
    const usedSubjectIds = new Set(finalRecommendations.map((r) => r.subjectId));
    const remainingCandidates = candidatePool.filter((c) => !usedSubjectIds.has(c.subjectId));
    const needed = targetCount - finalRecommendations.length;
    const fillCourses = generateFallbackRecommendations(context, answers, remainingCandidates, needed);
    finalRecommendations = [...finalRecommendations, ...fillCourses];
  }

  await prisma.$transaction(async (tx) => {
    const recommendation = await tx.student_recommendations.upsert({
      where: {
        student_id_semester_schedule_id: {
          student_id: student.id,
          semester_schedule_id: context.activeSemesterSchedule.id,
        },
      },
      update: {},
      create: {
        student_id: student.id,
        semester_schedule_id: context.activeSemesterSchedule.id,
      },
    });

    await tx.student_recommendation_subjects.deleteMany({
      where: { student_recommendation_id: recommendation.id },
    });

    if (finalRecommendations.length > 0) {
      await tx.student_recommendation_subjects.createMany({
        data: finalRecommendations.map((item) => ({
          student_recommendation_id: recommendation.id,
          semester_subject_id: item.semesterSubjectId,
          semester_section_id: item.semesterSectionId,
          reason: item.reasons[0] ?? null,
        })),
      });
    }
  });

  const userMessages = getAnswerMessages(updatedMessages);
  const followUpMessages = userMessages.slice(recommendationQuestions.length);
  const followUpNote = followUpMessages.at(-1)?.content;
  const assistantResponse = await createRecommendationResponse(summary, answers, finalRecommendations, followUpNote);

  await prisma.recommendation_messages.create({
    data: {
      conversation_id: conversation.id,
      role: "ASSISTANT",
      content: assistantResponse,
    },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/chat");
  redirect("/dashboard/courses");
}

export async function restartChat() {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    throw new Error("Student session is required.");
  }

  const student = user.student;

  await prisma.$transaction(async (tx) => {
    const conversations = await tx.recommendation_conversations.findMany({
      where: { student_id: student.id },
      select: { id: true },
    });

    if (conversations.length > 0) {
      await tx.recommendation_messages.deleteMany({
        where: {
          conversation_id: {
            in: conversations.map((conversation) => conversation.id),
          },
        },
      });

      await tx.recommendation_conversations.deleteMany({
        where: { student_id: student.id },
      });
    }

    const context = await getStudentRecommendationContext(student.id);

    await tx.student_recommendations.deleteMany({
      where: {
        student_id: student.id,
        semester_schedule_id: context.activeSemesterSchedule.id,
      },
    });
  });

  revalidatePath("/dashboard/chat");
  redirect("/dashboard/chat");
}
