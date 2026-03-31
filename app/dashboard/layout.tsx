import { requireSession } from "@/lib/auth/session";
import { getUserForSession } from "@/lib/auth/users";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("STUDENT");
  const user = await getUserForSession(session.userId);

  return (
    <DashboardLayoutClient
      studentName={user?.student?.name ?? session.email}
      studentId={user?.student?.rsu_id ?? "-"}
    >
      {children}
    </DashboardLayoutClient>
  );
}
