import { NavLink } from 'react-router-dom'
import { ShieldCheck, X } from 'lucide-react'
import { NAV_ITEMS } from '@/data/nav'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Menyuni yopish"
        className={`fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-[2px] transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col bg-ink-900 text-ink-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold tracking-tight text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
              CX
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-white">
                Chaqiruv xat
              </p>
              <p className="text-[11px] text-ink-400">Hujjat ishlab chiqarish</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            Menyular
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? 'bg-ink-800 text-white shadow-[inset_3px_0_0_0_#2563eb]'
                      : 'hover:bg-ink-800/70 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="m-3 rounded-2xl border border-ink-700 bg-ink-800/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-brand-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold">Mahalliy ishlov</span>
          </div>
          <p className="text-[12px] leading-relaxed text-ink-400">
            Excel brauzerda o‘qiladi. Word namuna dasturga o‘rnatilgan.
          </p>
        </div>
      </aside>
    </>
  )
}
