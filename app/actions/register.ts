"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";

type CourseEntry = {
  code: string;
  credit: string;
  grade: string;
  semesterNo: string;
  semesterYear: string;
};

export type RegisterState = {
  error: string | null;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = formData.get("name");
  const studentId = formData.get("studentId");
  const email = formData.get("email");
  const password = formData.get("password");
  const majorId = formData.get("majorId");
  const coursesJson = formData.get("courses");

  if (
    typeof name !== "string" || !name.trim() ||
    typeof studentId !== "string" || !studentId.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string" || !password.trim() ||
    typeof majorId !== "string" || !majorId.trim()
  ) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const existingStudent = await prisma.students.findUnique({
    where: { rsu_id: studentId.trim() },
  });
  if (existingStudent) {
    return { error: "This student ID is already registered." };
  }

  let courses: CourseEntry[] = [];
  if (typeof coursesJson === "string" && coursesJson) {
    try {
      courses = JSON.parse(coursesJson);
    } catch {
      // ignore malformed JSON
    }
  }

  let destination: string;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email: normalizedEmail,
        password_hash: passwordHash,
        role: "STUDENT",
      },
    });

    const student = await prisma.students.create({
      data: {
        user_id: user.id,
        rsu_id: studentId.trim(),
        name: name.trim(),
        major_id: parseInt(majorId, 10),
      },
    });

    for (const course of courses) {
      if (!course.code?.trim() || !course.grade?.trim()) continue;

      const subject = await prisma.subjects.findUnique({
        where: { code: course.code.trim().toUpperCase() },
      });

      if (!subject) continue;

      await prisma.student_course_histories.create({
        data: {
          student_id: student.id,
          subject_id: subject.id,
          grade: course.grade.trim(),
          credit_earned: parseInt(course.credit, 10) || subject.credit,
          semester_no: course.semesterNo ? parseInt(course.semesterNo, 10) : null,
          semester_year: course.semesterYear ? parseInt(course.semesterYear, 10) : null,
          source: "MANUAL",
        },
      });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: "STUDENT",
    });

    destination = "/dashboard";
  } catch (error) {
    console.error("Registration failed", error);
    return { error: "Registration failed. Please try again." };
  }

  redirect(destination);
}
