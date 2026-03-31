import { getInstructors } from "./actions"
import InstructorsClient from "./instructors-client"

export default async function InstructorsPage() {
  const instructors = await getInstructors()

  const rows = instructors.map((i) => ({
    id: i.id,
    userId: i.user_id,
    name: i.name,
    email: i.user.email,
    department: i.department ?? "",
    bio: i.bio ?? "",
    profileUrl: i.profile_url ?? "",
    personalitySummary: i.personality_summary ?? "",
    createdAt: i.user.created_at.toISOString(),
  }))

  return <InstructorsClient initialInstructors={rows} />
}
