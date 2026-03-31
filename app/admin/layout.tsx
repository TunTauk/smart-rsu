// Root /admin layout — no sidebar here.
// The sidebar lives in app/admin/(panel)/layout.tsx and only wraps the
// actual dashboard pages, NOT the login page.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
