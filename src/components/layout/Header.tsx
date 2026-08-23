import { Menu, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/data/nav'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-ink-200 p-2 text-ink-700 hover:bg-ink-50 lg:hidden"
          onClick={onMenuClick}
          aria-label="Menyuni ochish"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
            Admin panel
          </p>
          <h1 className="text-[15px] font-semibold tracking-tight text-ink-900">
            {current?.label ?? 'Chaqiruv xat'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
        <ShieldCheck size={14} />
        <span className="hidden text-xs font-medium sm:inline">
          Fayllar brauzerda qoladi
        </span>
        <span className="text-xs font-medium sm:hidden">Mahalliy</span>
      </div>
    </header>
  )
}
