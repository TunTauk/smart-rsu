"use client"

import { useState, useTransition, useCallback, useEffect, useRef } from "react"
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  UserCircle2,
  Mail,
  Building2,
  Tag,
  FileText,
  Link as LinkIcon,
  KeyRound,
} from "lucide-react"
import {
  createInstructor,
  updateInstructor,
  deleteInstructor,
  type InstructorInput,
} from "./actions"

// ── Types ─────────────────────────────────────────────────────────────────────
type Instructor = {
  id: number
  userId: number
  name: string
  email: string
  department: string
  bio: string
  profileUrl: string
  personalitySummary: string
  createdAt: string
}

type Props = {
  initialInstructors: Instructor[]
}

function blankForm(isCreate: boolean): InstructorInput & { password: string } {
  return {
    email: "",
    password: "",
    name: "",
    department: "",
    bio: "",
    profileUrl: "",
    personalitySummary: "",
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InstructorsClient({ initialInstructors }: Props) {
  const [instructors, setInstructors] = useState<Instructor[]>(initialInstructors)
  const [search, setSearch] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<InstructorInput & { password: string }>(blankForm(true))
  const [showPassword, setShowPassword] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (panelOpen) setTimeout(() => firstInputRef.current?.focus(), 80)
  }, [panelOpen])

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Panel helpers ─────────────────────────────────────────────────────
  function openCreate() {
    setEditingId(null)
    setForm(blankForm(true))
    setShowPassword(false)
    setPanelOpen(true)
  }

  function openEdit(i: Instructor) {
    setEditingId(i.id)
    setForm({
      email: i.email,
      password: "",
      name: i.name,
      department: i.department,
      bio: i.bio,
      profileUrl: i.profileUrl,
      personalitySummary: i.personalitySummary,
    })
    setShowPassword(false)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditingId(null)
  }

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // ── Submit ────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (editingId !== null) {
        const result = await updateInstructor(editingId, form)
        if (result.success) {
          setInstructors((prev) =>
            prev.map((i) =>
              i.id === editingId
                ? {
                    ...i,
                    name: form.name,
                    email: form.email,
                    department: form.department ?? "",
                    bio: form.bio ?? "",
                    profileUrl: form.profileUrl ?? "",
                    personalitySummary: form.personalitySummary ?? "",
                  }
                : i
            )
          )
          showToast("success", `Instructor "${form.name}" updated.`)
          closePanel()
        } else {
          showToast("error", result.error)
        }
      } else {
        const result = await createInstructor(form)
        if (result.success) {
          setInstructors((prev) => [
            ...prev,
            {
              id: result.data.id,
              userId: 0,
              name: form.name,
              email: form.email,
              department: form.department ?? "",
              bio: form.bio ?? "",
              profileUrl: form.profileUrl ?? "",
              personalitySummary: form.personalitySummary ?? "",
              createdAt: new Date().toISOString(),
            },
          ])
          showToast("success", `Instructor "${form.name}" created.`)
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
      const result = await deleteInstructor(id)
      if (result.success) {
        setInstructors((prev) => prev.filter((i) => i.id !== id))
        showToast("success", "Instructor deleted.")
        if (detailId === id) setDetailId(null)
      } else {
        showToast("error", result.error)
      }
      setDeleteConfirmId(null)
    })
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const filtered = instructors.filter((i) => {
    const q = search.toLowerCase()
    return (
      !q ||
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.department.toLowerCase().includes(q)
    )
  })

  const detailInstructor = instructors.find((i) => i.id === detailId) ?? null

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-screen flex-col bg-[#f9fafb]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-8">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-[#0a0a0a]">Instructors</h1>
          <p className="text-xs text-[#737373]">Manage instructor accounts and profiles</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008dbf]"
        >
          <Plus className="h-4 w-4" />
          Add Instructor
        </button>
      </header>

      {/* ── Search bar ──────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e5e5e5] bg-white px-8 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by name, email, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-[#e5e5e5] bg-[#f9fafb] pl-9 pr-3 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40"
          />
        </div>
        <span className="text-xs text-[#737373]">
          {filtered.length} of {instructors.length} instructor{instructors.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Main area (cards + detail) ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Card grid */}
        <div className={`flex-1 overflow-y-auto p-6 ${detailId ? "pr-4" : ""}`}>
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[#737373]">
              <Users className="h-10 w-10 text-[#d4d4d4]" />
              <p className="text-sm">
                {search ? "No instructors match your search." : "No instructors yet. Add one to get started."}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 rounded-md bg-[#00A6DD] px-4 py-2 text-sm font-medium text-white hover:bg-[#008dbf]"
                >
                  <Plus className="h-4 w-4" /> Add Instructor
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((instructor) => (
                <InstructorCard
                  key={instructor.id}
                  instructor={instructor}
                  isSelected={detailId === instructor.id}
                  deleteConfirmId={deleteConfirmId}
                  isPending={isPending}
                  onSelect={() => setDetailId(detailId === instructor.id ? null : instructor.id)}
                  onEdit={() => openEdit(instructor)}
                  onDeleteRequest={() => setDeleteConfirmId(instructor.id)}
                  onDeleteCancel={() => setDeleteConfirmId(null)}
                  onDeleteConfirm={() => handleDelete(instructor.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detailInstructor && (
          <DetailPanel
            instructor={detailInstructor}
            onClose={() => setDetailId(null)}
            onEdit={() => openEdit(detailInstructor)}
          />
        )}
      </div>

      {/* ── Create/Edit slide-in panel backdrop ─────────────────── */}
      {panelOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]" onClick={closePanel} />
      )}

      {/* ── Create/Edit slide-in panel ───────────────────────────── */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-[520px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">
              {editingId !== null ? "Edit Instructor" : "Add Instructor"}
            </h2>
            <p className="text-xs text-[#737373]">
              {editingId !== null
                ? "Update instructor information and account details."
                : "Create a new instructor account with profile."}
            </p>
          </div>
          <button onClick={closePanel} className="flex h-8 w-8 items-center justify-center rounded-md text-[#737373] hover:bg-[#f5f5f5]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Panel form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-6 px-6 py-6">

            {/* ── Account section ── */}
            <Section label="Account">
              <div className="flex gap-4">
                <Field label="Email address" required className="flex-1">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                    <input
                      ref={firstInputRef}
                      type="email"
                      placeholder="instructor@rsu.ac.th"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              </div>
              <Field label={editingId !== null ? "New Password" : "Password"} required={editingId === null}>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={editingId !== null ? "Leave blank to keep current" : "At least 6 characters"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required={editingId === null}
                    className={`${inputCls} pl-9 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#737373]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </Section>

            {/* ── Profile section ── */}
            <Section label="Profile">
              <div className="flex gap-4">
                <Field label="Full Name" required className="flex-1">
                  <div className="relative">
                    <UserCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                    <input
                      type="text"
                      placeholder="e.g. Dr. Araya Petcharat"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
                <Field label="Department" className="flex-1">
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={form.department ?? ""}
                      onChange={(e) => set("department", e.target.value)}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Profile Image URL">
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={form.profileUrl ?? ""}
                    onChange={(e) => set("profileUrl", e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {/* Image preview */}
                {form.profileUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={form.profileUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-full object-cover border border-[#e5e5e5]"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <span className="text-xs text-[#737373]">Preview</span>
                  </div>
                )}
              </Field>

              <Field label="Biography">
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#a3a3a3]" />
                  <textarea
                    rows={3}
                    placeholder="Brief description of the instructor's background and expertise…"
                    value={form.bio ?? ""}
                    onChange={(e) => set("bio", e.target.value)}
                    className={`${inputCls} resize-none pl-9 pt-2.5`}
                  />
                </div>
              </Field>
            </Section>

            {/* ── Personality section ── */}
            <Section label="Personality & Recommendation">
              <Field label="Personality Summary">
                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#a3a3a3]" />
                  <textarea
                    rows={4}
                    placeholder="Describe the instructor's teaching style and personality for AI recommendation matching…&#10;e.g. Calm, methodical, focused on fundamentals. Prefers structured learning with clear milestones."
                    value={form.personalitySummary ?? ""}
                    onChange={(e) => set("personalitySummary", e.target.value)}
                    className={`${inputCls} resize-none pl-9 pt-2.5`}
                  />
                </div>
                <p className="text-xs text-[#737373]">
                  Used by the AI recommendation system to match instructors with students based on learning style preferences.
                </p>
              </Field>
            </Section>

          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-end gap-3 border-t border-[#e5e5e5] px-6 py-4">
            <button
              type="button"
              onClick={closePanel}
              className="h-9 rounded-md border border-[#e5e5e5] px-4 text-sm font-medium text-[#0a0a0a] hover:bg-[#f5f5f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#00A6DD] px-5 text-sm font-medium text-white hover:bg-[#008dbf] disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId !== null ? "Save Changes" : "Create Instructor"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
          {toast.message}
        </div>
      )}
    </div>
  )
}

// ── Instructor Card ───────────────────────────────────────────────────────────
function InstructorCard({
  instructor,
  isSelected,
  deleteConfirmId,
  isPending,
  onSelect,
  onEdit,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: {
  instructor: Instructor
  isSelected: boolean
  deleteConfirmId: number | null
  isPending: boolean
  onSelect: () => void
  onEdit: () => void
  onDeleteRequest: () => void
  onDeleteCancel: () => void
  onDeleteConfirm: () => void
}) {
  const initials = instructor.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  const isConfirming = deleteConfirmId === instructor.id

  return (
    <div
      className={`flex flex-col rounded-lg border bg-white shadow-sm transition-all ${
        isSelected ? "border-[#00A6DD] ring-1 ring-[#00A6DD]/30" : "border-[#e5e5e5] hover:border-[#d4d4d4]"
      }`}
    >
      {/* Card body */}
      <button
        onClick={onSelect}
        className="flex flex-1 items-start gap-3.5 p-4 text-left"
      >
        {/* Avatar */}
        {instructor.profileUrl ? (
          <img
            src={instructor.profileUrl}
            alt={instructor.name}
            className="h-11 w-11 shrink-0 rounded-full object-cover border border-[#e5e5e5]"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00A6DD] to-[#1565C0] text-sm font-bold text-white">
            {initials}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-[15px] font-semibold text-[#0a0a0a]">{instructor.name}</span>
          <span className="truncate text-xs text-[#737373]">{instructor.email}</span>
          {instructor.department && (
            <span className="mt-1 flex items-center gap-1 text-xs text-[#a3a3a3]">
              <Building2 className="h-3 w-3 shrink-0" />
              {instructor.department}
            </span>
          )}
        </div>
      </button>

      {/* Card footer */}
      <div className="flex items-center justify-between border-t border-[#f5f5f5] px-4 py-2.5">
        <span className="text-[11px] text-[#a3a3a3]">
          Added {new Date(instructor.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] hover:bg-[#f0f0f0] hover:text-[#0a0a0a]"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {isConfirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDeleteConfirm}
                disabled={isPending}
                className="flex h-7 items-center gap-1 rounded-md bg-red-500 px-2 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Confirm
              </button>
              <button
                onClick={onDeleteCancel}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] hover:bg-[#f0f0f0]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onDeleteRequest}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] hover:bg-red-50 hover:text-[#DC0963]"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({
  instructor,
  onClose,
  onEdit,
}: {
  instructor: Instructor
  onClose: () => void
  onEdit: () => void
}) {
  const initials = instructor.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <aside className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[#e5e5e5] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
        <span className="text-sm font-semibold text-[#0a0a0a]">Instructor Profile</span>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] hover:bg-[#f5f5f5]">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Profile hero */}
      <div className="flex flex-col items-center gap-3 border-b border-[#e5e5e5] px-5 py-6">
        {instructor.profileUrl ? (
          <img
            src={instructor.profileUrl}
            alt={instructor.name}
            className="h-20 w-20 rounded-full object-cover border-2 border-[#e5e5e5]"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00A6DD] to-[#1565C0] text-2xl font-bold text-white">
            {initials}
          </div>
        )}
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-[15px] font-semibold text-[#0a0a0a]">{instructor.name}</span>
          <span className="text-xs text-[#737373]">{instructor.email}</span>
          {instructor.department && (
            <span className="mt-1 rounded-full bg-[#00A6DD]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#00A6DD]">
              {instructor.department}
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-md border border-[#e5e5e5] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f5f5f5]"
        >
          <Pencil className="h-3 w-3" /> Edit Profile
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 px-5 py-5">
        {instructor.bio && (
          <DetailField label="Biography" icon={<FileText className="h-3.5 w-3.5" />}>
            <p className="text-sm leading-relaxed text-[#0a0a0a]">{instructor.bio}</p>
          </DetailField>
        )}
        {instructor.personalitySummary && (
          <DetailField label="Personality & Teaching Style" icon={<Tag className="h-3.5 w-3.5" />}>
            <p className="text-sm leading-relaxed text-[#0a0a0a]">{instructor.personalitySummary}</p>
          </DetailField>
        )}
        {!instructor.bio && !instructor.personalitySummary && (
          <p className="text-center text-xs text-[#a3a3a3]">No additional profile info. Click Edit Profile to add details.</p>
        )}
      </div>
    </aside>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#a3a3a3]">{label}</span>
        <div className="h-px flex-1 bg-[#f0f0f0]" />
      </div>
      {children}
    </div>
  )
}

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

function DetailField({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[#737373]">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  )
}

const inputCls =
  "h-10 w-full rounded-md border border-[#e5e5e5] bg-white px-3 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#00A6DD]/40 transition-shadow"
