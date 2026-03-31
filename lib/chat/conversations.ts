import { prisma } from "@/lib/prisma";
import { getNextQuestion } from "@/lib/chat/question-flow";
import { getStudentRecommendationContext } from "@/lib/chat/recommendation-engine";

export async function getOrCreateConversation(studentId: number) {
  const existingConversation = await prisma.recommendation_conversations.findFirst({
    where: { student_id: studentId },
    include: {
      messages: {
        orderBy: { created_at: "asc" },
      },
    },
    orderBy: { updated_at: "desc" },
  });

  if (existingConversation) {
    if (existingConversation.messages.length === 0) {
      const firstQuestion = getNextQuestion(0);

      await prisma.recommendation_messages.create({
        data: {
          conversation_id: existingConversation.id,
          role: "ASSISTANT",
          content: firstQuestion?.prompt ?? "",
        },
      });

      existingConversation.messages = await prisma.recommendation_messages.findMany({
        where: { conversation_id: existingConversation.id },
        orderBy: { created_at: "asc" },
      });
    }

    return existingConversation;
  }

  const conversation = await prisma.recommendation_conversations.create({
    data: { student_id: studentId },
  });

  await getStudentRecommendationContext(studentId);
  const firstQuestion = getNextQuestion(0);

  await prisma.recommendation_messages.create({
    data: {
      conversation_id: conversation.id,
      role: "ASSISTANT",
      content: firstQuestion?.prompt ?? "",
    },
  });

  return prisma.recommendation_conversations.findUniqueOrThrow({
    where: { id: conversation.id },
    include: {
      messages: {
        orderBy: { created_at: "asc" },
      },
    },
  });
}
