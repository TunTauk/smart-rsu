"use server";

import { redirect } from "next/navigation";
import { createSession, clearSession, getPostLoginPath } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/auth/users";

export async function login(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Please enter your email and password." };
  }

  if (!email.trim() || !password.trim()) {
    return { error: "Please enter your email and password." };
  }

  let destination: string;

  try {
    const user = await authenticateUser(email, password);

    if (!user) {
      return { error: "Invalid email or password." };
    }

    destination = getPostLoginPath(user.role);

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login failed", error);

    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return { error: "Server auth secret is missing. Please check AUTH_SECRET." };
    }

    return { error: "Unable to sign in right now. Please try again." };
  }

  redirect(destination);
}

export async function logout() {
  await clearSession();
  redirect("/");
}
