import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";
import { getOrCreateConversation } from "@/lib/chat/conversations";
import { getAnswerMessages, getNextQuestion, recommendationQuestions } from "@/lib/chat/question-flow";
import { buildStudentSummary, getStudentRecommendationContext } from "@/lib/chat/recommendation-engine";

export default async function ChatPage() {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    redirect("/");
  }

  const [conversation, context] = await Promise.all([
    getOrCreateConversation(user.student.id),
    getStudentRecommendationContext(user.student.id),
  ]);
  const summary = buildStudentSummary(context);
  const answerCount = Math.min(getAnswerMessages(conversation.messages).length, recommendationQuestions.length);
  const currentQuestion = getNextQuestion(answerCount);

  return <ChatInterface currentQuestion={currentQuestion} messages={conversation.messages} summary={summary} />;
}
