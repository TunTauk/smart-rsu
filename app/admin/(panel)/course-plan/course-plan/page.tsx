import { getSubjects, getSemesterSchedules, getCoursePlanForSemester } from "./actions"
import CoursePlanClient from "./course-plan-client"

export default async function CoursePlanPage() {
  const [subjects, schedules] = await Promise.all([
    getSubjects(),
    getSemesterSchedules(),
  ])

  // Default to latest semester
  const latestSchedule = schedules[0] ?? null
  const existingPlan = latestSchedule
    ? await getCoursePlanForSemester(latestSchedule.id)
    : []

  // Flatten into rows for the table
  const existingRows = existingPlan.flatMap((ss) =>
    ss.sections.flatMap((sec) =>
      sec.meetings.map((meeting) => ({
        id: sec.id,
        subjectId: ss.subject.id,
        subjectCode: ss.subject.code,
        subjectName: ss.subject.name,
        sectionCode: sec.code,
        dayOfWeek: meeting.day_of_week,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        room: meeting.room ?? "",
      }))
    )
  )

  return (
    <CoursePlanClient
      subjects={subjects}
      schedules={schedules.map((s) => ({
        id: s.id,
        label: `Semester ${s.semester_no}/${s.semester_year} — ${s.major.name}`,
      }))}
      defaultScheduleId={latestSchedule?.id ?? null}
      initialRows={existingRows}
    />
  )
}
