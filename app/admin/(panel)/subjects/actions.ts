"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type SubjectInput = {
  code: string
  name: string
  description?: string
  type: string
  credit: number
  prerequisiteId?: number | null
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateSubject(input: SubjectInput): string | null {
  if (!input.code?.trim()) return "Subject code is required."
  if (!input.name?.trim()) return "Subject name is required."
  if (!input.type?.trim()) return "Subject type is required."
  if (!Number.isInteger(input.credit) || input.credit < 0 || input.credit > 20)
    return "Credit must be a whole number between 0 and 20."
  return null
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
export async function getSubjects() {
  return prisma.subjects.findMany({
    orderBy: { code: "asc" },
    include: {
      prerequisite: { select: { id: true, code: true, name: true } },
    },
  })
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createSubject(input: SubjectInput): Promise<ActionResult<{ id: number }>> {
  const err = validateSubject(input)
  if (err) return { success: false, error: err }

  // Check duplicate code
  const existing = await prisma.subjects.findUnique({ where: { code: input.code.trim().toUpperCase() } })
  if (existing) return { success: false, error: `Subject code "${input.code.toUpperCase()}" already exists.` }

  try {
    const subject = await prisma.subjects.create({
      data: {
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        description: input.description?.trim() || null,
        type: input.type.trim(),
        credit: input.credit,
        prerequisite_id: input.prerequisiteId ?? null,
      },
    })
    revalidatePath("/admin/subjects")
    return { success: true, data: { id: subject.id } }
  } catch (e) {
    console.error("createSubject error:", e)
    return { success: false, error: "Failed to create subject. Please try again." }
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateSubject(id: number, input: SubjectInput): Promise<ActionResult> {
  const err = validateSubject(input)
  if (err) return { success: false, error: err }

  // Check duplicate code (ignore current)
  const existing = await prisma.subjects.findFirst({
    where: { code: input.code.trim().toUpperCase(), NOT: { id } },
  })
  if (existing) return { success: false, error: `Subject code "${input.code.toUpperCase()}" is already used.` }

  try {
    await prisma.subjects.update({
      where: { id },
      data: {
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        description: input.description?.trim() || null,
        type: input.type.trim(),
        credit: input.credit,
        prerequisite_id: input.prerequisiteId ?? null,
      },
    })
    revalidatePath("/admin/subjects")
    return { success: true, data: undefined }
  } catch (e) {
    console.error("updateSubject error:", e)
    return { success: false, error: "Failed to update subject. Please try again." }
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteSubject(id: number): Promise<ActionResult> {
  try {
    await prisma.subjects.delete({ where: { id } })
    revalidatePath("/admin/subjects")
    return { success: true, data: undefined }
  } catch (e) {
    console.error("deleteSubject error:", e)
    return { success: false, error: "This subject may have dependencies and cannot be deleted." }
  }
}
