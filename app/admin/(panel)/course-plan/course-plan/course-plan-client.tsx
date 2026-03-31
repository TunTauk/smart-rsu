"use client"

import { useState, useRef, useTransition, useCallback } from "react"
import {
  FileSpreadsheet,
  Download,
  FileUp,
  Paperclip,
  Table2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { saveCoursePlan, deleteSemesterSection, type CoursePlanRow } from "./actions"

// ── Types ─────────────────────────────────────────────────────────────────────
type Subject = {
  id: number
  code: string
  name: string
  type: string
  credit: number
}

type Schedule = {
  id: number
  label: string
}

type PlanRow = {
  id?: number               // existing section id from DB
  tempId: string            // local unique key
  subjectId: number
  subjectCode: string
  subjectName: string
  sectionCode: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room: string
  isEditing: boolean
}

type Props = {
  subjects: Subject[]
  schedules: Schedule[]
  defaultScheduleId: number | null
  initialRows: {
    id: number
    subjectId: number
    subjectCode: string
    subjectName: string
    sectionCode: string
    dayOfWeek: string
    startTime: string
    endTime: string
    room: string
  }[]
}

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
]

const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
}

let tempCounter = 0
function newTempId() {
  return `tmp-${++tempCounter}`
}

function makeBlankRow(subjects: Subject[]): PlanRow {
  const first = subjects[0]
  return {
    tempId: newTempId(),
    subjectId: first?.id ?? 0,
    subjectCode: first?.code ?? "",
    subjectName: first?.name ?? "",
    sectionCode: "",
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "12:00",
    room: "",
    isEditing: true,
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CoursePlanClient({
  subjects,
  schedules,
  defaultScheduleId,
  initialRows,
}: Props) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(defaultScheduleId)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<PlanRow[]>(() =>
    initialRows.map((r) => ({ ...r, tempId: newTempId(), isEditing: false }))
  )
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Toast helper ─────────────────────────────────────────────────────
  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Drag & Drop handlers ─────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }
  function handleDragLeave() {
    setIsDragging(false)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelected(file)
  }
  function handleFileSelected(file: File) {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ]
    if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showToast("error", "Please upload an .xlsx, .xls, or .csv file.")
      return
    }
    setUploadedFileName(file.name)
    showToast("success", `"${file.name}" uploaded. Manual parsing coming soon.`)
  }

  // ── Row CRUD helpers ─────────────────────────────────────────────────
  function addRow() {
    setRows((prev) => [...prev, makeBlankRow(subjects)])
  }

  function updateRow(tempId: string, changes: Partial<PlanRow>) {
    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, ...changes } : r))
    )
  }

  function commitRow(tempId: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.tempId === tempId ? { ...r, isEditing: false } : r
      )
    )
  }

  function cancelRow(tempId: string, hadId: boolean) {
    if (!hadId) {
      // new row — just remove it
      setRows((prev) => prev.filter((r) => r.tempId !== tempId))
    } else {
      setRows((prev) =>
        prev.map((r) => (r.tempId === tempId ? { ...r, isEditing: false } : r))
      )
    }
  }

  function deleteRow(row: PlanRow) {
    if (row.id) {
      startTransition(async () => {
        const result = await deleteSemesterSection(row.id!)
        if (result.success) {
          setRows((prev) => prev.filter((r) => r.tempId !== row.tempId))
          showToast("success", "Row deleted.")
        } else {
          showToast("error", result.error)
        }
      })
    } else {
      setRows((prev) => prev.filter((r) => r.tempId !== row.tempId))
    }
  }

  function onSubjectChange(tempId: string, subjectId: number) {
    const sub = subjects.find((s) => s.id === subjectId)
    if (!sub) return
    updateRow(tempId, {
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
    })
  }

  // ── Save all ─────────────────────────────────────────────────────────
  function handleSave() {
    if (!selectedScheduleId) {
      showToast("error", "Please select a semester first.")
      return
    }
    if (rows.length === 0) {
      showToast("error", "Add at least one row before saving.")
      return
    }

    const payload: CoursePlanRow[] = rows.map((r) => ({
      subjectId: r.subjectId,
      sectionCode: r.sectionCode,
      dayOfWeek: r.dayOfWeek as any,
      startTime: r.startTime,
      endTime: r.endTime,
      room: r.room || undefined,
    }))

    startTransition(async () => {
      const result = await saveCoursePlan({
        semesterScheduleId: selectedScheduleId,
        rows: payload,
      })
      if (result.success) {
        showToast("success", "Course plan saved successfully!")
      } else {
        showToast("error", result.error)
      }
    })
  }

  return (
    <div className="flex h-screen flex-col bg-[#f9fafb]">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-8">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-[#0a0a0a]">Course Plan</h1>
          <p className="text-xs text-[#737373]">Upload or manually enter the course plan schedule</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Semester selector */}
          <div className="relative">
            <select
              value={selectedScheduleId ?? ""}
              onChange={(e) => setSelectedScheduleId(Number(e.target.value) || null)}
              className="h-9 appearance-none rounded-md border border-[#e5e5e5] bg-white pl-3 pr-8 text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"
            >
              <option value="">Select Semester</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          </div>

          {/* Download template */}
          <button className="flex h-9 items-center gap-1.5 rounded-md border border-[#e5e5e5] bg-white px-3.5 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
            <Download className="h-4 w-4 text-[#737373]" />
            Download Template
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex h-9 items-center gap-1.5 rounded-md bg-[#00A6DD] px-4 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Course Plan
          </button>
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">

        {/* ── Upload card ─────────────────────────────────────────── */}
        <div className="rounded-lg border border-[#e5e5e5] bg-white shadow-sm">
          {/* Card header */}
          <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-6 py-4">
            <FileSpreadsheet className="h-[18px] w-[18px] text-[#00A6DD]" />
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Upload Excel File</h2>
            {uploadedFileName && (
              <span className="ml-auto rounded-full bg-[#00A6DD]/10 px-2.5 py-0.5 text-xs font-medium text-[#00A6DD]">
                {uploadedFileName}
              </span>
            )}
          </div>

          {/* Drop zone */}
          <div
            className={`m-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 transition-colors ${
              isDragging
                ? "border-[#00A6DD] bg-[#00A6DD]/5"
                : "border-[#e5e5e5] bg-[#f9fafb] hover:border-[#00A6DD]/50 hover:bg-[#00A6DD]/[0.02]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0]">
              <FileUp className="h-6 w-6 text-[#737373]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#0a0a0a]">
                Drag &amp; drop your .xlsx or .csv file here
              </p>
              <p className="mt-0.5 text-xs text-[#737373]">or</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf]"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Browse File
            </button>
            <p className="text-xs text-[#737373]">Supported: .xlsx, .xls, .csv — Max 20MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelected(file)
                e.target.value = ""
              }}
            />
          </div>
        </div>

        {/* ── Manual entry card ────────────────────────────────────── */}
        <div className="flex flex-1 flex-col rounded-lg border border-[#e5e5e5] bg-white shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4">
            <div className="flex items-center gap-2">
              <Table2 className="h-[18px] w-[18px] text-[#00A6DD]" />
              <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Manual Entry</h2>
              <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-xs text-[#737373]">
                {rows.length} row{rows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-md bg-[#00A6DD] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#008dbf]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#f9fafb]">
                  {["Section", "Day", "Time Slot", "Room", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-[#e5e5e5] px-4 py-3 text-left text-[13px] font-semibold text-[#737373]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-[#737373]">
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="h-6 w-6 text-[#d4d4d4]" />
                        <span>Click &ldquo;Add Row&rdquo; to manually add subjects, sections and time slots</span>
                      </div>
                    </td>
                  </tr>
                ) : (() => {
                  // Group rows by subjectId, preserving first-appearance order
                  const order: number[] = []
                  const grouped = new Map<number, PlanRow[]>()
                  for (const row of rows) {
                    if (!grouped.has(row.subjectId)) {
                      order.push(row.subjectId)
                      grouped.set(row.subjectId, [])
                    }
                    grouped.get(row.subjectId)!.push(row)
                  }

                  return order.map((subjectId) => {
                    const group = grouped.get(subjectId)!
                    const first = group[0]
                    return (
                      <GroupedSubjectRows
                        key={subjectId}
                        subjectCode={first.subjectCode}
                        subjectName={first.subjectName}
                        rows={group}
                        subjects={subjects}
                        onEdit={(tempId) => updateRow(tempId, { isEditing: true })}
                        onDelete={(row) => deleteRow(row)}
                        onChange={(tempId, changes) => updateRow(tempId, changes)}
                        onSubjectChange={(tempId, id) => onSubjectChange(tempId, id)}
                        onCommit={(tempId) => commitRow(tempId)}
                        onCancel={(tempId, hadId) => cancelRow(tempId, hadId)}
                        isPending={isPending}
                      />
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}

// ── Grouped subject rows ───────────────────────────────────────────────────────
function GroupedSubjectRows({
  subjectCode,
  subjectName,
  rows,
  subjects,
  onEdit,
  onDelete,
  onChange,
  onSubjectChange,
  onCommit,
  onCancel,
  isPending,
}: {
  subjectCode: string
  subjectName: string
  rows: PlanRow[]
  subjects: Subject[]
  onEdit: (tempId: string) => void
  onDelete: (row: PlanRow) => void
  onChange: (tempId: string, changes: Partial<PlanRow>) => void
  onSubjectChange: (tempId: string, id: number) => void
  onCommit: (tempId: string) => void
  onCancel: (tempId: string, hadId: boolean) => void
  isPending: boolean
}) {
  return (
    <>
      {/* Subject group header */}
      <tr className="bg-[#f0f7ff]">
        <td colSpan={5} className="border-l-4 border-[#00A6DD] py-2.5 pl-3 pr-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0a0a0a]">{subjectCode}</span>
            <span className="text-[#d4d4d4]">·</span>
            <span className="text-[13px] text-[#4a4a4a]">{subjectName}</span>
            <span className="ml-auto rounded-full bg-[#00A6DD]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#00A6DD]">
              {rows.length} section{rows.length !== 1 ? "s" : ""}
            </span>
          </div>
        </td>
      </tr>
      {/* Section rows */}
      {rows.map((row, idx) =>
        row.isEditing ? (
          <EditingRow
            key={row.tempId}
            row={row}
            subjects={subjects}
            onChange={(changes) => onChange(row.tempId, changes)}
            onSubjectChange={(id) => onSubjectChange(row.tempId, id)}
            onCommit={() => onCommit(row.tempId)}
            onCancel={() => onCancel(row.tempId, !!row.id)}
            isLast={idx === rows.length - 1}
          />
        ) : (
          <ReadRow
            key={row.tempId}
            row={row}
            onEdit={() => onEdit(row.tempId)}
            onDelete={() => onDelete(row)}
            isPending={isPending}
            isLast={idx === rows.length - 1}
          />
        )
      )}
      {/* Group spacer */}
      <tr><td colSpan={5} className="h-2 bg-[#f9fafb]" /></tr>
    </>
  )
}

// ── Read-only row (section only — subject shown in group header) ───────────────
function ReadRow({
  row,
  onEdit,
  onDelete,
  isPending,
  isLast,
}: {
  row: PlanRow
  onEdit: () => void
  onDelete: () => void
  isPending: boolean
  isLast: boolean
}) {
  return (
    <tr className={`transition-colors hover:bg-[#f0f7ff] ${isLast ? "border-b-0" : "border-b border-[#e8f4fb]"}`}>
      <td className="border-l-4 border-[#00A6DD]/25 py-3 pl-7 pr-4 font-medium text-[#0a0a0a]">{row.sectionCode || "—"}</td>
      <td className="px-4 py-3 text-[#0a0a0a]">{DAY_SHORT[row.dayOfWeek] ?? row.dayOfWeek}</td>
      <td className="px-4 py-3 text-[#0a0a0a]">
        {row.startTime} – {row.endTime}
      </td>
      <td className="px-4 py-3 text-[#737373]">{row.room || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#f0f0f0] hover:text-[#0a0a0a]"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-red-50 hover:text-[#DC0963] disabled:opacity-40"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Editing row ───────────────────────────────────────────────────────────────
function EditingRow({
  row,
  subjects,
  onChange,
  onSubjectChange,
  onCommit,
  onCancel,
  isLast,
}: {
  row: PlanRow
  subjects: Subject[]
  onChange: (changes: Partial<PlanRow>) => void
  onSubjectChange: (id: number) => void
  onCommit: () => void
  onCancel: () => void
  isLast: boolean
}) {
  const inputCls =
    "h-8 w-full rounded border border-[#e5e5e5] bg-white px-2 text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"

  return (
    <tr className={`bg-[#e8f4fb] ${isLast ? "" : "border-b border-[#00A6DD]/20"}`}>
      {/* Section + subject selector stacked */}
      <td className="border-l-4 border-[#00A6DD] py-2.5 pl-7 pr-4">
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Section code"
            value={row.sectionCode}
            onChange={(e) => onChange({ sectionCode: e.target.value })}
            className={inputCls}
          />
          <select
            value={row.subjectId}
            onChange={(e) => onSubjectChange(Number(e.target.value))}
            className={inputCls + " text-[11px] text-[#737373]"}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <select
          value={row.dayOfWeek}
          onChange={(e) => onChange({ dayOfWeek: e.target.value })}
          className={inputCls}
        >
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1">
          <input
            type="time"
            value={row.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="h-8 rounded border border-[#e5e5e5] bg-white px-1.5 text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"
          />
          <span className="text-xs text-[#737373]">–</span>
          <input
            type="time"
            value={row.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className="h-8 rounded border border-[#e5e5e5] bg-white px-1.5 text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"
          />
        </div>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="text"
          placeholder="Room (optional)"
          value={row.room}
          onChange={(e) => onChange({ room: e.target.value })}
          className={inputCls}
        />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCommit}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00A6DD] text-white transition-colors hover:bg-[#008dbf]"
            title="Confirm"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e5e5] text-[#737373] transition-colors hover:bg-[#f5f5f5]"
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
