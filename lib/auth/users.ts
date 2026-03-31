import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.users.findUnique({
    where: { email: normalizedEmail },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          rsu_id: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  if (user.role === "STUDENT" && !user.student) {
    throw new Error("Student profile is missing for this account.");
  }

  if (user.role === "INSTRUCTOR" && !user.instructor) {
    throw new Error("Instructor profile is missing for this account.");
  }

  return user;
}

export async function getUserForSession(userId: number) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      student: {
        select: {
          id: true,
          name: true,
          rsu_id: true,
          major: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          department: true,
          personality_summary: true,
        },
      },
    },
  });
}
