"use server"

import { redirect } from "next/navigation"
import { createSession } from "@/lib/auth/session"
import { authenticateUser } from "@/lib/auth/users"

export async function adminLogin(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get("email")
  const password = formData.get("password")

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Please enter your email and password." }
  }

  if (!email.trim() || !password.trim()) {
    return { error: "Please enter your email and password." }
  }

  try {
    const user = await authenticateUser(email.trim(), password)

    if (!user) {
      return { error: "Invalid email or password." }
    }

    if ((user.role as string) !== "ADMIN") {
      return { error: "Access denied. This portal is for administrators only." }
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN",
    })
  } catch (error) {
    console.error("Admin login failed", error)
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return { error: "Server configuration error. Please contact support." }
    }
    return { error: "Unable to sign in right now. Please try again." }
  }

  redirect("/admin/course-plan")
}
