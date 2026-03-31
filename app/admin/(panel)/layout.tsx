import AdminLayoutClient from "../layout-client"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
