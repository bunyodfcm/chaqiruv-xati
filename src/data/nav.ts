import {
  FileOutput,
  FileSpreadsheet,
  FileType,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Boshqaruv paneli',
    description: 'Umumiy holat va keyingi qadamlar',
    icon: LayoutDashboard,
  },
  {
    to: '/excel',
    label: 'Excel ma\'lumotlari',
    description: 'Jadval fayllarini yuklash',
    icon: FileSpreadsheet,
  },
  {
    to: '/shablonlar',
    label: 'Word shablonlar',
    description: 'Hujjat shablonlarini yuklash',
    icon: FileType,
  },
  {
    to: '/hujjatlar',
    label: 'Hujjatlar',
    description: 'Word fayllarni generatsiya qilish',
    icon: FileOutput,
    badge: 'Tez orada',
  },
]
