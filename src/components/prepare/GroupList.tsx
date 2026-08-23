import { Users } from 'lucide-react'
import type { StudentGroup } from '@/types/prepare'

interface GroupListProps {
  groups: StudentGroup[]
}

export function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) return null

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink-800">
          Guruhlar ({groups.length})
        </h3>
        <p className="text-xs text-ink-400">
          Jami {groups.reduce((sum, g) => sum + g.students.length, 0)} talaba
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li
            key={group.name}
            className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Users size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">
                {group.name}
              </p>
              <p className="truncate text-xs text-ink-400">
                {group.students.length} talaba
                {group.faculty ? ` · ${group.faculty}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
