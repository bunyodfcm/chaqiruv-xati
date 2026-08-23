import { useState } from 'react'
import {
  ChevronDown,
  Download,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { AddressField } from '@/components/prepare/AddressField'
import { GroupPicker } from '@/components/prepare/GroupPicker'
import { downloadWordDocument } from '@/lib/word'
import { usePrepare } from '@/store/PrepareContext'
import {
  formatStartNum,
  type DocumentTemplate,
  type StudentGroup,
} from '@/types/prepare'

interface TemplateCardProps {
  template: DocumentTemplate
  availableGroups: StudentGroup[]
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number'
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={type === 'number' ? 1 : undefined}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400"
      />
    </label>
  )
}

export function TemplateCard({
  template,
  availableGroups,
}: TemplateCardProps) {
  const {
    updateShared,
    addGroupsToTemplate,
    removeGroupFromTemplate,
    updateTemplateGroup,
    removeTemplate,
  } = usePrepare()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setError(null)
    setGenerating(true)
    try {
      await downloadWordDocument(template)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Word yaratishda xatolik yuz berdi',
      )
    } finally {
      setGenerating(false)
    }
  }

  const previewNums = template.groups.map((_, i) =>
    formatStartNum(template.shared.startNum + i),
  )

  return (
    <article className="rounded-2xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">
            {template.name}
          </h3>
          <p className="text-xs text-ink-400">
            {template.groups.length} guruh · 1 Word fayl
            {previewNums.length > 0
              ? ` · № ${previewNums[0]}${previewNums.length > 1 ? `…${previewNums[previewNums.length - 1]}` : ''}`
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <Plus size={15} />
            Guruh qo‘shish
          </button>
          <button
            type="button"
            disabled={template.groups.length === 0 || generating}
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
          >
            <Download size={15} />
            {generating ? 'Yaratilmoqda…' : 'Word yuklab olish'}
          </button>
          <button
            type="button"
            onClick={() => removeTemplate(template.id)}
            className="rounded-xl p-2 text-ink-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Shablonni o‘chirish"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-ink-400 uppercase">
            Butun Word uchun
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Sana (create_date)"
              value={template.shared.createDate}
              onChange={(v) => updateShared(template.id, { createDate: v })}
              placeholder="22.04.2026"
            />
            <Field
              label="Kod (code)"
              value={template.shared.code}
              onChange={(v) => updateShared(template.id, { code: v })}
              placeholder="IQ "
            />
            <Field
              label="Boshlang‘ich raqam (start_num)"
              type="number"
              value={template.shared.startNum}
              onChange={(v) =>
                updateShared(template.id, {
                  startNum: Math.max(1, Number(v) || 1),
                })
              }
            />
            <Field
              label="Mutaxassislik nomi (specialization)"
              value={template.shared.specialization}
              onChange={(v) =>
                updateShared(template.id, { specialization: v })
              }
              placeholder="Buxgalteriya hisobi va audit…"
            />
            <Field
              label="Muddat (duration)"
              value={template.shared.duration}
              onChange={(v) => updateShared(template.id, { duration: v })}
              placeholder="2026-yil 04-maydan 30-maygacha"
            />
            <Field
              label="Vaqt (study_time)"
              value={template.shared.studyTime}
              onChange={(v) => updateShared(template.id, { studyTime: v })}
              placeholder="15:30"
            />
            <Field
              label="Dekan (decan_name)"
              value={template.shared.decanName}
              onChange={(v) => updateShared(template.id, { decanName: v })}
              placeholder="E.Ibadullayev"
            />
            <div className="sm:col-span-2">
              <AddressField
                value={template.shared.address}
                onChange={(v) => updateShared(template.id, { address: v })}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-ink-400 uppercase">
            Qo‘shilgan guruhlar
          </p>
          {template.groups.length === 0 ? (
            <p className="rounded-xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-400">
              Hali guruh yo‘q. «Guruh qo‘shish» orqali tanlang.
            </p>
          ) : (
            <ul className="space-y-2">
              {template.groups.map((group, index) => {
                const open = expandedGroup === group.groupName
                const num = formatStartNum(
                  template.shared.startNum + index,
                )
                return (
                  <li
                    key={group.groupName}
                    className="overflow-hidden rounded-xl border border-ink-100"
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroup(open ? null : group.groupName)
                        }
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                        <Users size={15} className="shrink-0 text-brand-600" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink-900">
                            {group.groupName}
                          </span>
                          <span className="block text-xs text-ink-400">
                            № {num} · {group.students.length} talaba
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          removeGroupFromTemplate(
                            template.id,
                            group.groupName,
                          )
                        }
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Guruhni olib tashlash"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {open ? (
                      <div className="grid gap-3 border-t border-ink-100 bg-ink-50/60 px-3 py-3 sm:grid-cols-2">
                        <Field
                          label="Fakultet"
                          value={group.facultyName}
                          onChange={(v) =>
                            updateTemplateGroup(
                              template.id,
                              group.groupName,
                              { facultyName: v },
                            )
                          }
                        />
                        <Field
                          label="Mutaxassislik kodi"
                          value={group.specializationCode}
                          onChange={(v) =>
                            updateTemplateGroup(
                              template.id,
                              group.groupName,
                              { specializationCode: v },
                            )
                          }
                        />
                        <Field
                          label="Kurs / semestr (cours)"
                          value={group.cours}
                          onChange={(v) =>
                            updateTemplateGroup(
                              template.id,
                              group.groupName,
                              { cours: v },
                            )
                          }
                        />
                        <div className="sm:col-span-2">
                          <p className="mb-1.5 text-xs font-medium text-ink-500">
                            Talabalar ({group.students.length})
                          </p>
                          <div className="max-h-40 overflow-y-auto rounded-lg border border-ink-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="sticky top-0 bg-ink-50 text-ink-500">
                                <tr>
                                  <th className="px-2 py-1.5 font-medium">
                                    №
                                  </th>
                                  <th className="px-2 py-1.5 font-medium">
                                    Talaba ID
                                  </th>
                                  <th className="px-2 py-1.5 font-medium">
                                    To‘liq ismi
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.students.map((s, i) => (
                                  <tr
                                    key={`${s.hemisId}-${i}`}
                                    className="border-t border-ink-100"
                                  >
                                    <td className="px-2 py-1 text-ink-400">
                                      {i + 1}
                                    </td>
                                    <td className="px-2 py-1 font-mono text-ink-700">
                                      {s.hemisId}
                                    </td>
                                    <td className="px-2 py-1 text-ink-800">
                                      {s.studentName}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
      </div>

      {pickerOpen ? (
        <GroupPicker
          groups={availableGroups}
          excludeNames={template.groups.map((g) => g.groupName)}
          onClose={() => setPickerOpen(false)}
          onConfirm={(names) => {
            addGroupsToTemplate(template.id, names)
            setPickerOpen(false)
          }}
        />
      ) : null}
    </article>
  )
}
