"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ── Types ─────────────────────────────────────────────────────────────────────
export type CoursePlanRow = {
  subjectId: number
  sectionCode: string
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
  startTime: string
  endTime: string
  room?: string
}

export type SaveCoursePlanInput = {
  semesterScheduleId: number
  rows: CoursePlanRow[]
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Validation ────────────────────────────────────────────────────────────────
const VALID_DAYS = new Set([
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
])

function validateCoursePlanInput(input: SaveCoursePlanInput): string | null {
  if (!input.semesterScheduleId || input.semesterScheduleId < 1) {
    return "A valid semester must be selected."
  }
  if (!Array.isArray(input.rows) || input.rows.length === 0) {
    return "At least one row is required."
  }
  for (const row of input.rows) {
    if (!row.subjectId || row.subjectId < 1) return "Each row must have a valid subject."
    if (!row.sectionCode?.trim()) return "Each row must have a section code."
    if (!VALID_DAYS.has(row.dayOfWeek)) return `Invalid day: ${row.dayOfWeek}`
    if (!/^\d{2}:\d{2}$/.test(row.startTime)) return "Start time must be HH:MM."
    if (!/^\d{2}:\d{2}$/.test(row.endTime)) return "End time must be HH:MM."
  }
  return null
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
export async function getSubjects() {
  return prisma.subjects.findMany({
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true, type: true, credit: true },
  })
}

export async function getSemesterSchedules() {
  return prisma.semester_schedules.findMany({
    orderBy: [{ semester_year: "desc" }, { semester_no: "desc" }],
    include: { major: { select: { code: true, name: true } } },
  })
}

export async function getCoursePlanForSemester(semesterScheduleId: number) {
  return prisma.semester_subjects.findMany({
    where: { semester_schedule_id: semesterScheduleId },
    include: {
      subject: { select: { id: true, code: true, name: true } },
      sections: {
        include: { meetings: true },
      },
    },
  })
}

// ── Save course plan ──────────────────────────────────────────────────────────
export async function saveCoursePlan(
  input: SaveCoursePlanInput
): Promise<ActionResult> {
  const validationError = validateCoursePlanInput(input)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const { semesterScheduleId, rows } = input

  try {
    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        // Upsert semester_subject
        const semSubject = await tx.semester_subjects.upsert({
          where: {
            semester_schedule_id_subject_id: {
              semester_schedule_id: semesterScheduleId,
              subject_id: row.subjectId,
            },
          },
          create: {
            semester_schedule_id: semesterScheduleId,
            subject_id: row.subjectId,
          },
          update: {},
        })

        // Upsert section
        const section = await tx.semester_sections.upsert({
          where: {
            semester_subject_id_code: {
              semester_subject_id: semSubject.id,
              code: row.sectionCode,
            },
          },
          create: {
            semester_subject_id: semSubject.id,
            code: row.sectionCode,
          },
          update: {},
        })

        // Replace meetings for this section
        await tx.semester_section_meetings.deleteMany({
          where: { semester_section_id: section.id },
        })
        await tx.semester_section_meetings.create({
          data: {
            semester_section_id: section.id,
            day_of_week: row.dayOfWeek as any,
            start_time: row.startTime,
            end_time: row.endTime,
            room: row.room ?? null,
          },
        })
      }
    })

    revalidatePath("/admin/course-plan")
    return { success: true, data: undefined }
  } catch (err) {
    console.error("saveCoursePlan error:", err)
    return { success: false, error: "Failed to save course plan. Please try again." }
  }
}

// ── Delete a section ──────────────────────────────────────────────────────────
export async function deleteSemesterSection(sectionId: number): Promise<ActionResult> {
  try {
    await prisma.semester_sections.delete({ where: { id: sectionId } })
    revalidatePath("/admin/course-plan")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to delete section." }
  }
}
