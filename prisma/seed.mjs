import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password", 10);

  const major = await prisma.majors.upsert({
    where: { code: "CS" },
    update: { name: "Computer Science" },
    create: {
      code: "CS",
      name: "Computer Science",
    },
  });

  const studentUser = await prisma.users.upsert({
    where: { email: "student@rsu.ac.th" },
    update: {
      password_hash: passwordHash,
      role: UserRole.STUDENT,
    },
    create: {
      email: "student@rsu.ac.th",
      password_hash: passwordHash,
      role: UserRole.STUDENT,
    },
  });

  await prisma.students.upsert({
    where: { user_id: studentUser.id },
    update: {
      rsu_id: "6500001",
      name: "Demo Student",
      major_id: major.id,
    },
    create: {
      user_id: studentUser.id,
      rsu_id: "6500001",
      name: "Demo Student",
      major_id: major.id,
    },
  });

  const instructorUser = await prisma.users.upsert({
    where: { email: "instructor@rsu.ac.th" },
    update: {
      password_hash: passwordHash,
      role: UserRole.INSTRUCTOR,
    },
    create: {
      email: "instructor@rsu.ac.th",
      password_hash: passwordHash,
      role: UserRole.INSTRUCTOR,
    },
  });

  await prisma.instructors.upsert({
    where: { user_id: instructorUser.id },
    update: {
      name: "Demo Instructor",
      department: "Computer Science",
      personality_summary: "Calm, structured, and supportive teaching style.",
    },
    create: {
      user_id: instructorUser.id,
      name: "Demo Instructor",
      department: "Computer Science",
      personality_summary: "Calm, structured, and supportive teaching style.",
    },
  });

  console.log("Seed complete.");
  console.log("Student login: student@rsu.ac.th / password");
  console.log("Instructor login: instructor@rsu.ac.th / password");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
