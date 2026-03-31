"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type InstructorInput = {
  // user fields
  email: string
  password?: string // only for create; optional for update
  // instructor fields
  name: string
  department?: string
  bio?: string
  profileUrl?: string
  personalitySummary?: string
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateInstructor(input: InstructorInput, isCreate: boolean): string | null {
  if (!input.email?.trim()) return "Email is required."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    return "Please enter a valid email address."
  if (!input.name?.trim()) return "Name is required."
  if (isCreate && !input.password?.trim()) return "Password is required for new accounts."
  if (isCreate && input.password && input.password.length < 6)
    return "Password must be at least 6 characters."
  return null
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
export async function getInstructors() {
  return prisma.instructors.findMany({
    orderBy: { name: "asc" },
    include: {
      user: { select: { id: true, email: true, created_at: true } },
    },
  })
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createInstructor(
  input: InstructorInput
): Promise<ActionResult<{ id: number }>> {
  const err = validateInstructor(input, true)
  if (err) return { success: false, error: err }

  const email = input.email.trim().toLowerCase()

  const existingUser = await prisma.users.findUnique({ where: { email } })
  if (existingUser) return { success: false, error: `An account with email "${email}" already exists.` }

  try {
    const passwordHash = await bcrypt.hash(input.password!, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email,
          password_hash: passwordHash,
          role: "INSTRUCTOR" as any,
        },
      })

      const instructor = await tx.instructors.create({
        data: {
          user_id: user.id,
          name: input.name.trim(),
          department: input.department?.trim() || null,
          bio: input.bio?.trim() || null,
          profile_url: input.profileUrl?.trim() || null,
          personality_summary: input.personalitySummary?.trim() || null,
        },
      })

      return instructor
    })

    revalidatePath("/admin/instructors")
    return { success: true, data: { id: result.id } }
  } catch (e) {
    console.error("createInstructor error:", e)
    return { success: false, error: "Failed to create instructor. Please try again." }
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateInstructor(
  id: number,
  input: InstructorInput
): Promise<ActionResult> {
  const err = validateInstructor(input, false)
  if (err) return { success: false, error: err }

  const instructor = await prisma.instructors.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!instructor) return { success: false, error: "Instructor not found." }

  const email = input.email.trim().toLowerCase()

  // Check email uniqueness (ignore current user)
  const conflict = await prisma.users.findFirst({
    where: { email, NOT: { id: instructor.user_id } },
  })
  if (conflict) return { success: false, error: `Email "${email}" is already in use.` }

  try {
    await prisma.$transaction(async (tx) => {
      const userUpdate: Record<string, unknown> = { email }
      if (input.password?.trim()) {
        userUpdate.password_hash = await bcrypt.hash(input.password, 10)
      }

      await tx.users.update({ where: { id: instructor.user_id }, data: userUpdate })

      await tx.instructors.update({
        where: { id },
        data: {
          name: input.name.trim(),
          department: input.department?.trim() || null,
          bio: input.bio?.trim() || null,
          profile_url: input.profileUrl?.trim() || null,
          personality_summary: input.personalitySummary?.trim() || null,
        },
      })
    })

    revalidatePath("/admin/instructors")
    return { success: true, data: undefined }
  } catch (e) {
    console.error("updateInstructor error:", e)
    return { success: false, error: "Failed to update instructor. Please try again." }
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteInstructor(id: number): Promise<ActionResult> {
  try {
    const instructor = await prisma.instructors.findUnique({ where: { id } })
    if (!instructor) return { success: false, error: "Instructor not found." }

    // Deleting the user cascades to instructor record
    await prisma.users.delete({ where: { id: instructor.user_id } })

    revalidatePath("/admin/instructors")
    return { success: true, data: undefined }
  } catch (e) {
    console.error("deleteInstructor error:", e)
    return { success: false, error: "Failed to delete instructor. They may have assigned sections." }
  }
}
