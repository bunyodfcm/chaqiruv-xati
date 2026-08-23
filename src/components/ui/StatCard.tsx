import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  hint: string
  icon: LucideIcon
  tone?: 'default' | 'muted'
}

const tones = {
  default: 'bg-white',
  muted: 'bg-white/70',
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: StatCardProps) {
  return (
    <article
      className={`rounded-2xl border border-ink-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-400">{hint}</p>
    </article>
  )
}
