import { getSubjects } from "./actions"
import SubjectsClient from "./subjects-client"

export default async function SubjectsPage() {
  const subjects = await getSubjects()

  const rows = subjects.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description ?? "",
    type: s.type,
    credit: s.credit,
    prerequisiteId: s.prerequisite_id ?? null,
    prerequisiteCode: s.prerequisite?.code ?? null,
    prerequisiteName: s.prerequisite?.name ?? null,
  }))

  // Subjects available as prerequisites (all subjects)
  const prereqOptions = subjects.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
  }))

  return <SubjectsClient initialSubjects={rows} prereqOptions={prereqOptions} />
}
