import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { StudentGroup } from '@/types/prepare'

interface GroupPickerProps {
  groups: StudentGroup[]
  excludeNames: string[]
  onConfirm: (groupNames: string[]) => void
  onClose: () => void
}

export function GroupPicker({
  groups,
  excludeNames,
  onConfirm,
  onClose,
}: GroupPickerProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const available = useMemo(() => {
    const excluded = new Set(excludeNames)
    const q = query.trim().toLowerCase()
    return groups.filter((g) => {
      if (excluded.has(g.name)) return false
      if (!q) return true
      return (
        g.name.toLowerCase().includes(q) ||
        g.faculty.toLowerCase().includes(q) ||
        g.specialtyCode.toLowerCase().includes(q)
      )
    })
  }, [groups, excludeNames, query])

  function toggle(name: string) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    )
  }

  function selectAllVisible() {
    setSelected((current) => {
      const set = new Set(current)
      for (const g of available) set.add(g.name)
      return [...set]
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/45 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-picker-title"
        className="flex max-h-[85svh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h3
            id="group-picker-title"
            className="text-sm font-semibold text-ink-900"
          >
            Guruh qo‘shish
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            aria-label="Yopish"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-ink-100 px-4 py-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Guruh qidirish…"
              className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2 pr-3 pl-9 text-sm text-ink-900 outline-none focus:border-brand-400 focus:bg-white"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
            <span>{available.length} ta mavjud</span>
            <button
              type="button"
              onClick={selectAllVisible}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Ko‘ringanlarni tanlash
            </button>
          </div>
        </div>

        <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {available.length === 0 ? (
            <li className="px-2 py-8 text-center text-sm text-ink-400">
              Qo‘shish uchun guruh qolmadi
            </li>
          ) : (
            available.map((group) => {
              const checked = selected.includes(group.name)
              return (
                <li key={group.name}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(group.name)}
                      className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {group.name}
                      </span>
                      <span className="block truncate text-xs text-ink-400">
                        {group.students.length} talaba
                        {group.specialtyCode
                          ? ` · ${group.specialtyCode}`
                          : ''}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })
          )}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
          <p className="text-xs text-ink-400">{selected.length} tanlandi</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Bekor
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onConfirm(selected)}
              className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
            >
              Qo‘shish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
