"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Paperclip, Send, Settings, Sparkles } from "lucide-react";
import { restartChat, submitChatAnswer } from "@/app/dashboard/chat/actions";
import { recommendationQuestions, type ChatQuestion } from "@/lib/chat/question-flow";
import type { StudentChatSummary } from "@/lib/chat/recommendation-engine";

type ChatMessage = {
  id: number;
  role: string;
  content: string;
};

type Props = {
  messages: ChatMessage[];
  currentQuestion: ChatQuestion | null;
  summary: StudentChatSummary;
};

function AnimatedAssistantMessage({
  content,
  active,
  onComplete,
}: {
  content: string;
  active: boolean;
  onComplete?: () => void;
}) {
  const [displayedContent, setDisplayedContent] = useState(active ? "" : content);

  useEffect(() => {
    if (!active) {
      setDisplayedContent(content);
      onComplete?.();
      return;
    }

    setDisplayedContent("");

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setDisplayedContent(content.slice(0, index));

      if (index >= content.length) {
        window.clearInterval(interval);
        onComplete?.();
      }
    }, 12);

    return () => window.clearInterval(interval);
  }, [active, content, onComplete]);

  return <p className="whitespace-pre-wrap text-sm text-[#0a0a0a]">{displayedContent}</p>;
}

function ClosedQuestionForm({ question }: { question: ChatQuestion }) {
  if (!question.options) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
      {question.options.map((option) => (
        <form action={submitChatAnswer} key={option.value}>
          <input type="hidden" name="questionId" value={question.id} />
          <input type="hidden" name="answer" value={option.value} />
          <button
            className="rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 py-2 font-medium text-[#737373] transition-colors hover:bg-[#e5e5e5]"
            type="submit"
          >
            {option.label}
          </button>
        </form>
      ))}
    </div>
  );
}

function RecommendationLoadingNotice({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#00A6DD]/20 bg-[#00A6DD]/5 px-4 py-3">
      <div className="mt-1 flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A6DD]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A6DD] [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A6DD] [animation-delay:240ms]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#0a0a0a]">Assistant is starting to look for suitable recommendations for you.</p>
        <p className="mt-1 text-xs text-[#737373]">Checking your preferences, current curriculum, and available sections...</p>
      </div>
    </div>
  );
}

function MultiSelectQuestionForm({ question }: { question: ChatQuestion }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allDaysOptionValue = question.id === "preferred_days" ? "ALL_DAYS" : null;

  if (!question.options) {
    return null;
  }

  return (
    <form action={submitChatAnswer} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="answer" value={selected.join("|")} />
      <div className="flex flex-wrap gap-1.5">
        {question.options.map((option) => {
          const active = selected.includes(option.value);

          return (
            <button
              className={
                active
                  ? "rounded-md bg-[#00A6DD] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  : "rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-1.5 text-xs font-semibold text-[#737373] transition-colors hover:bg-[#e5e5e5]"
              }
                key={option.value}
                onClick={(event) => {
                  event.preventDefault();
                  setSelected((current) => {
                    if (current.includes(option.value)) {
                      return current.filter((value) => value !== option.value);
                    }

                    if (allDaysOptionValue && option.value === allDaysOptionValue) {
                      return [allDaysOptionValue];
                    }

                    const nextValues = allDaysOptionValue
                      ? current.filter((value) => value !== allDaysOptionValue)
                      : current;

                    return [...nextValues, option.value];
                  });
                }}
                type="button"
              >
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        className="inline-flex w-fit items-center justify-center rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={selected.length === 0}
        type="submit"
      >
        Continue
      </button>
    </form>
  );
}

function Composer({ currentQuestion }: { currentQuestion: ChatQuestion | null }) {
  const isOpenEnded = currentQuestion?.type === "open_ended";
  const isFinalRecommendationQuestion = currentQuestion?.id === recommendationQuestions.at(-1)?.id;

  if (currentQuestion?.type === "multiple_choice") {
    return <ClosedQuestionForm question={currentQuestion} />;
  }

  if (currentQuestion?.type === "multi_select") {
    return <MultiSelectQuestionForm question={currentQuestion} />;
  }

  return (
    <form action={submitChatAnswer} className="flex w-full shrink-0 flex-col gap-3 border-t border-[#e5e5e5] bg-white px-6 py-3">
      <input type="hidden" name="questionId" value={isOpenEnded ? currentQuestion.id : "follow_up"} />
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#f5f5f5] px-4 py-2.5">
          <button className="text-[#737373] transition-colors hover:text-[#0a0a0a]" type="button">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            className="flex-1 bg-transparent text-sm text-[#0a0a0a] outline-none placeholder:text-[#737373]"
            name="answer"
            placeholder={
              isOpenEnded
                ? "Type your answer here..."
                : "Ask for another recommendation angle..."
            }
            type="text"
          />
        </div>
        <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00A6DD] text-white shadow-sm transition-colors hover:bg-[#008dbf]" type="submit">
          <Send className="ml-0.5 h-4 w-4" />
        </button>
      </div>
      <FinalQuestionLoadingInline visible={isFinalRecommendationQuestion} />
    </form>
  );
}

function FinalQuestionLoadingInline({ visible }: { visible: boolean }) {
  const { pending } = useFormStatus();

  return <RecommendationLoadingNotice visible={visible && pending} />;
}

export function ChatInterface({ messages, currentQuestion, summary }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [animationDoneForMessageId, setAnimationDoneForMessageId] = useState<number | null>(null);

  useEffect(() => {
    const lastMessage = messages.at(-1);

    if (lastMessage?.role === "ASSISTANT") {
      setAnimationDoneForMessageId(null);
    }
  }, [messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, animationDoneForMessageId]);

  return (
    <div className="flex h-screen w-full flex-col bg-[#f9fafb]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A6DD]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[15px] font-semibold text-[#0a0a0a]">Enrollment Assistant</h1>
            <div className="mt-0.5 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
              <span className="text-xs text-[#16A34A]">Online &middot; Personalized for you</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={restartChat}>
            <button
              className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-medium text-[#737373] transition-colors hover:bg-[#f5f5f5]"
              type="submit"
            >
              Restart chat
            </button>
          </form>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-[#f5f5f5]" type="button">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6 pb-4" ref={scrollContainerRef}>
        <div className="flex w-full gap-3 xl:max-w-[75%]">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col gap-3 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white p-4 pb-5 shadow-sm">
            <p className="text-sm text-[#0a0a0a]">Hi {summary.studentName}! Here&apos;s a summary of your current enrollment:</p>

            <div className="flex flex-row overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f9fafb]">
              <div className="flex flex-1 flex-col justify-center border-r border-[#e5e5e5] px-4 py-3">
                <span className="text-xl font-bold text-[#00A6DD]">{summary.currentRegisteredSubjects}</span>
                <span className="mt-1 text-[11px] leading-snug text-[#737373]">Subjects<br/>Registered</span>
              </div>
              <div className="flex flex-1 flex-col justify-center border-r border-[#e5e5e5] px-4 py-3">
                <span className="text-xl font-bold text-[#A89A6F]">{summary.earnedCredits} cr.</span>
                <span className="mt-1 text-[11px] leading-snug text-[#737373]">Credits<br/>Earned</span>
              </div>
              <div className="flex flex-1 flex-col justify-center px-4 py-3">
                <span className="text-xl font-bold text-[#16A34A]">{summary.cumulativeGpa}</span>
                <span className="mt-1 text-[11px] leading-snug text-[#737373]">Cumulative<br/>GPA</span>
              </div>
            </div>

            <p className="text-[13px] text-[#737373]">
              We estimate you&apos;ll graduate in {summary.estimatedGraduationYear} at your current pace.
            </p>
          </div>
        </div>

        {messages.map((message, index) => {
          const isAssistant = message.role === "ASSISTANT";
          const isLatestAssistant = isAssistant && index === messages.length - 1;
          const showAnimatedMessage = isLatestAssistant && animationDoneForMessageId !== message.id;
          const showQuestionActions =
            isLatestAssistant &&
            animationDoneForMessageId === message.id &&
            (currentQuestion?.type === "multiple_choice" || currentQuestion?.type === "multi_select");

          return isAssistant ? (
            <div className="flex w-full gap-3 xl:max-w-[75%]" key={message.id}>
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00A6DD]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex flex-col gap-3 rounded-[0_16px_16px_16px] border border-[#e5e5e5] bg-white p-4 shadow-sm">
                <AnimatedAssistantMessage
                  active={showAnimatedMessage}
                  content={message.content}
                  onComplete={() => {
                    if (isLatestAssistant) {
                      setAnimationDoneForMessageId(message.id);
                    }
                  }}
                />
                {showQuestionActions && currentQuestion?.type === "multiple_choice" ? (
                  <ClosedQuestionForm question={currentQuestion} />
                ) : null}
                {showQuestionActions && currentQuestion?.type === "multi_select" ? (
                  <MultiSelectQuestionForm question={currentQuestion} />
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex w-full justify-end" key={message.id}>
              <div className="max-w-[75%] rounded-[16px_16px_0_16px] bg-[#00A6DD] px-4 py-3 shadow-sm">
                <p className="whitespace-pre-wrap text-sm text-white">{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {currentQuestion?.type === "multiple_choice" || currentQuestion?.type === "multi_select" ? null : (
        <Composer currentQuestion={currentQuestion} />
      )}
    </div>
  );
}
