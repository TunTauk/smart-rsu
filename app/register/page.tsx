import { prisma } from "@/lib/prisma";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  const [majors, subjects] = await Promise.all([
    prisma.majors.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subjects.findMany({
      select: { code: true, name: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return <RegisterForm majors={majors} subjects={subjects} />;
}
