"use client"

import { useState, useTransition, useCallback, useEffect, useRef } from "react"
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  BookMarked,
} from "lucide-react"
import { createSubject, updateSubject, deleteSubject, type SubjectInput } from "./actions"

// ── Types ─────────────────────────────────────────────────────────────────────
type Subject = {
  id: number
  code: string
  name: string
  description: string
  type: string
  credit: number
  prerequisiteId: number | null
  prerequisiteCode: string | null
  prerequisiteName: string | null
}

type PrereqOption = { id: number; code: string; name: string }

type Props = {
  initialSubjects: Subject[]
  prereqOptions: PrereqOption[]
}

const SUBJECT_TYPES = ["Core", "Elective", "Lecture", "Lab", "Seminar", "Independent Study"]
const CREDITS = [0, 1, 2, 3, 4, 5, 6]

// ── Blank form state ──────────────────────────────────────────────────────────
function blankForm(): SubjectInput {
  return {
    code: "",
    name: "",
    description: "",
    type: "Core",
    credit: 3,
    prerequisiteId: null,
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SubjectsClient({ initialSubjects, prereqOptions }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [form, setForm] = useState<SubjectInput>(blankForm())
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Focus first input when panel opens
  useEffect(() => {
    if (panelOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [panelOpen])

  // ── Toast  ────────────────────────────────────────────────────────────
  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Panel helpers ─────────────────────────────────────────────────────
  function openCreate() {
    setEditingSubject(null)
    setForm(blankForm())
    setPanelOpen(true)
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject)
    setForm({
      code: subject.code,
      name: subject.name,
      description: subject.description,
      type: subject.type,
      credit: subject.credit,
      prerequisiteId: subject.prerequisiteId,
    })
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditingSubject(null)
    setForm(blankForm())
  }

  // ── Form submit ───────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (editingSubject) {
        const result = await updateSubject(editingSubject.id, form)
        if (result.success) {
          // Optimistic update
          setSubjects((prev) =>
            prev.map((s) =>
              s.id === editingSubject.id
                ? {
                    ...s,
                    ...form,
                    code: form.code.toUpperCase(),
                    prerequisiteId: form.prerequisiteId ?? null,
                    prerequisiteCode:
                      prereqOptions.find((p) => p.id === form.prerequisiteId)?.code ?? null,
                    prerequisiteName:
                      prereqOptions.find((p) => p.id === form.prerequisiteId)?.name ?? null,
                  }
                : s
            )
          )
          showToast("success", `Subject "${form.code.toUpperCase()}" updated.`)
          closePanel()
        } else {
          showToast("error", result.error)
        }
      } else {
        const result = await createSubject(form)
        if (result.success) {
          const prereq = prereqOptions.find((p) => p.id === form.prerequisiteId)
          setSubjects((prev) => [
            ...prev,
            {
              id: result.data.id,
              code: form.code.toUpperCase(),
              name: form.name,
              description: form.description ?? "",
              type: form.type,
              credit: form.credit,
              prerequisiteId: form.prerequisiteId ?? null,
              prerequisiteCode: prereq?.code ?? null,
              prerequisiteName: prereq?.name ?? null,
            },
          ])
          showToast("success", `Subject "${form.code.toUpperCase()}" created.`)
          closePanel()
        } else {
          showToast("error", result.error)
        }
      }
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────
  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteSubject(id)
      if (result.success) {
        setSubjects((prev) => prev.filter((s) => s.id !== id))
        showToast("success", "Subject deleted.")
      } else {
        showToast("error", result.error)
      }
      setDeleteConfirmId(null)
    })
  }

  // ── Filtered list ─────────────────────────────────────────────────────
  const uniqueTypes = ["All", ...Array.from(new Set(subjects.map((s) => s.type)))]
  const filtered = subjects.filter((s) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    const matchesType = typeFilter === "All" || s.type === typeFilter
    return matchesSearch && matchesType
  })

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-screen flex-col bg-[#f9fafb]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-8">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-[#0a0a0a]">Subjects</h1>
          <p className="text-xs text-[#737373]">Manage the course catalog subjects</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf]"
        >
          <Plus className="h-4 w-4" />
          Create Subject
        </button>
      </header>

      {/* ── Filters bar ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e5e5e5] bg-white px-8 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by code or name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-[#e5e5e5] bg-[#f9fafb] pl-9 pr-3 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 appearance-none rounded-md border border-[#e5e5e5] bg-[#f9fafb] pl-3 pr-8 text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"
          >
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
        </div>

        <span className="text-xs text-[#737373]">
          {filtered.length} of {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[#f9fafb]">
            <tr>
              {["Code", "Name", "Type", "Credits", "Prerequisite", ""].map((h) => (
                <th
                  key={h}
                  className="border-b border-[#e5e5e5] px-6 py-3 text-left text-[13px] font-semibold text-[#737373]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-[#737373]">
                    <BookMarked className="h-8 w-8 text-[#d4d4d4]" />
                    <p className="text-sm">
                      {searchQuery || typeFilter !== "All"
                        ? "No subjects match your filter."
                        : "No subjects yet. Create one to get started."}
                    </p>
                    {!searchQuery && typeFilter === "All" && (
                      <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf]"
                      >
                        <Plus className="h-4 w-4" />
                        Create Subject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[#f5f5f5] transition-colors hover:bg-white"
                >
                  <td className="px-6 py-3.5">
                    <span className="rounded bg-[#00A6DD]/10 px-2 py-0.5 text-[13px] font-semibold text-[#00A6DD]">
                      {s.code}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#0a0a0a]">{s.name}</span>
                      {s.description && (
                        <span className="mt-0.5 text-xs text-[#737373] line-clamp-1">
                          {s.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <TypeBadge type={s.type} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-[#0a0a0a]">
                      {s.credit} cr
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {s.prerequisiteCode ? (
                      <span className="text-sm text-[#737373]">
                        <span className="font-medium text-[#0a0a0a]">{s.prerequisiteCode}</span>
                        {" — "}
                        {s.prerequisiteName}
                      </span>
                    ) : (
                      <span className="text-xs text-[#a3a3a3]">None</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#f0f0f0] hover:text-[#0a0a0a]"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirmId === s.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={isPending}
                            className="flex h-8 items-center gap-1 rounded-md bg-red-500 px-2 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                          >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#f0f0f0]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-red-50 hover:text-[#DC0963]"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Slide-in panel backdrop ──────────────────────────────── */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
          onClick={closePanel}
        />
      )}

      {/* ── Slide-in panel ───────────────────────────────────────── */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">
              {editingSubject ? "Edit Subject" : "Create Subject"}
            </h2>
            <p className="text-xs text-[#737373]">
              {editingSubject
                ? "Update the subject attributes."
                : "Define a new subject for the course catalog."}
            </p>
          </div>
          <button
            onClick={closePanel}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#f5f5f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Panel form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-5 px-6 py-6">

            {/* Code + Name side by side */}
            <div className="flex gap-4">
              <Field label="Subject Code" required className="w-36 shrink-0">
                <input
                  ref={firstInputRef}
                  type="text"
                  placeholder="e.g. CS101"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Subject Name" required className="flex-1">
                <input
                  type="text"
                  placeholder="e.g. Introduction to Programming"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Description */}
            <Field label="Description">
              <textarea
                rows={3}
                placeholder="Briefly describe what this subject is about…"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* Type + Credits side by side */}
            <div className="flex gap-4">
              <Field label="Subject Type" required className="flex-1">
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    required
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {SUBJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                </div>
              </Field>
              <Field label="Credits" required className="w-32 shrink-0">
                <div className="relative">
                  <select
                    value={form.credit}
                    onChange={(e) => setForm((f) => ({ ...f, credit: Number(e.target.value) }))}
                    required
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {CREDITS.map((c) => (
                      <option key={c} value={c}>
                        {c} {c === 1 ? "credit" : "credits"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                </div>
              </Field>
            </div>

            {/* Prerequisite */}
            <Field label="Prerequisite Subject">
              <div className="relative">
                <select
                  value={form.prerequisiteId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      prerequisiteId: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="">None</option>
                  {prereqOptions
                    .filter((p) => !editingSubject || p.id !== editingSubject.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
              </div>
              {/* Hint */}
              <div className="mt-2 flex items-start gap-1.5 rounded-md bg-[#00A6DD]/5 px-3 py-2 text-xs text-[#00A6DD]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Leave empty if the subject has no prerequisites.
              </div>
            </Field>

          </div>

          {/* Panel footer */}
          <div className="mt-auto flex items-center justify-end gap-3 border-t border-[#e5e5e5] px-6 py-4">
            <button
              type="button"
              onClick={closePanel}
              className="h-9 rounded-md border border-[#e5e5e5] px-4 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#00A6DD] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008dbf] disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingSubject ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
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

// ── Reusable Field wrapper ────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-sm font-medium text-[#0a0a0a]">
        {label}
        {required && <span className="ml-0.5 text-[#DC0963]">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Type badge ────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Core: "bg-[#00A6DD]/10 text-[#00A6DD]",
  Elective: "bg-purple-100 text-purple-700",
  Lecture: "bg-amber-100 text-amber-700",
  Lab: "bg-green-100 text-green-700",
  Seminar: "bg-pink-100 text-pink-700",
  "Independent Study": "bg-gray-100 text-gray-700",
}

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700"
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${cls}`}>
      {type}
    </span>
  )
}

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  "h-10 w-full rounded-md border border-[#e5e5e5] bg-white px-3 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40 transition-shadow"
