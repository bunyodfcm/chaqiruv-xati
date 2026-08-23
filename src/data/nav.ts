import { FileText, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Chaqiruv xati tayyorlash',
    description: 'Excel yuklash va chaqiruv xati yaratish',
    icon: FileText,
  },
]
