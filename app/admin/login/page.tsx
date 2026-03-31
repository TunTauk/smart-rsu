import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import AdminLoginForm from "./admin-login-form"

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session?.role === "ADMIN") {
    redirect("/admin/course-plan")
  }
  return <AdminLoginForm />
}
