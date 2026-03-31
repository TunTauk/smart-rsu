"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";
import { getStudentRecommendationContext } from "@/lib/chat/recommendation-engine";

export async function saveCourseSelection(sectionIds: number[]) {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  if (!user?.student) {
    throw new Error("Student session required.");
  }

  const studentId = user.student.id;
  const context = await getStudentRecommendationContext(studentId);

  const recommendation = await prisma.student_recommendations.findFirst({
    where: {
      student_id: studentId,
      semester_schedule_id: context.activeSemesterSchedule.id,
    },
  });

  if (!recommendation) {
    throw new Error("No recommendation record found for this semester.");
  }

  if (sectionIds.length === 0) {
    await prisma.student_recommendation_subjects.deleteMany({
      where: { student_recommendation_id: recommendation.id },
    });
    revalidatePath("/dashboard/courses");
    return;
  }

  const sections = await prisma.semester_sections.findMany({
    where: { id: { in: sectionIds } },
    select: { id: true, semester_subject_id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.student_recommendation_subjects.deleteMany({
      where: { student_recommendation_id: recommendation.id },
    });

    await tx.student_recommendation_subjects.createMany({
      data: sections.map((s) => ({
        student_recommendation_id: recommendation.id,
        semester_subject_id: s.semester_subject_id,
        semester_section_id: s.id,
      })),
    });
  });

  revalidatePath("/dashboard/courses");
}
