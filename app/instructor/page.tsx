import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";

export default async function InstructorPage() {
  const session = await requireSession("INSTRUCTOR");
  const user = await getUserForSession(session.userId);

  if (!user?.instructor) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Instructor Portal</h1>
        <p className="text-sm text-zinc-600">Logged in as {user.instructor.name}</p>
      </div>

      <div className="rounded-lg border p-4 text-sm text-zinc-700">
        <p>Email: {session.email}</p>
        <p>Department: {user.instructor.department ?? "-"}</p>
        <p>Personality Summary: {user.instructor.personality_summary ?? "-"}</p>
      </div>

      <form action={logout}>
        <button className="w-fit rounded-md bg-black px-4 py-2 text-sm text-white" type="submit">
          Logout
        </button>
      </form>
    </main>
  );
}
