import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AppRole = "STUDENT" | "INSTRUCTOR";

const SESSION_COOKIE_NAME = "smart-rsu-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  role: AppRole;
  email: string;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "number" ||
      typeof payload.email !== "string" ||
      (payload.role !== "STUDENT" && payload.role !== "INSTRUCTOR")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export async function redirectIfAuthenticated() {
  const session = await getSession();

  if (!session) {
    return;
  }

  redirect(getPostLoginPath(session.role));
}

export async function requireSession(role?: AppRole) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (role && session.role !== role) {
    redirect(getPostLoginPath(session.role));
  }

  return session;
}

export function getPostLoginPath(role: AppRole) {
  return role === "STUDENT" ? "/dashboard" : "/instructor";
}
