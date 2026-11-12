import {
  HOUR_OPTIONS,
  hourOptionByHours,
  type DavomatForm,
  type HourOptionHours,
  type Semestr,
} from '@/types/davomat'

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
] as const

function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

function dayMonth(parts: { month: number; day: number }): string {
  return `${parts.day}-${UZ_MONTHS[parts.month - 1]}`
}

function yearDayMonth(parts: { year: number; month: number; day: number }): string {
  return `${parts.year}-yil ${dayMonth(parts)}`
}

/** "2026-10-21" → "2026-yil 21-oktabr" */
export function formatUzLongDate(iso: string): string {
  const parts = parseIsoDate(iso)
  if (!parts) return ''
  return yearDayMonth(parts)
}

/** "2026-yil 21-sentabrdan 20-oktabrgacha bo‘lgan davr" */
export function formatNbDavr(fromIso: string, toIso: string): string {
  const from = parseIsoDate(fromIso)
  const to = parseIsoDate(toIso)
  if (!from || !to) return ''
  if (from.year === to.year) {
    return `${from.year}-yil ${dayMonth(from)}dan ${dayMonth(to)}gacha bo‘lgan davr`
  }
  return `${yearDayMonth(from)}dan ${yearDayMonth(to)}gacha bo‘lgan davr`
}

export function currentAcademicStartYear(now = new Date()): number {
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

export function formatAcademicYear(startYear: number): string {
  return `${startYear}/${startYear + 1}`
}

/** 10 o‘quv yili: joriydan 2 yil oldin — 7 yil oldinga. */
export function academicYearOptions(now = new Date()): string[] {
  const current = currentAcademicStartYear(now)
  return Array.from({ length: 10 }, (_, index) =>
    formatAcademicYear(current - 2 + index),
  )
}

export function defaultSemestr(now = new Date()): Semestr {
  const month = now.getMonth()
  return month >= 1 && month <= 6 ? 'bahorgi' : 'kuzgi'
}

export function defaultDavomatForm(): DavomatForm {
  const hours: HourOptionHours = 30
  const option = hourOptionByHours(hours)
  return {
    dekan_name: '',
    ogohlantirish_soati: hours,
    oquv_yili: formatAcademicYear(currentAcademicStartYear()),
    semestr: defaultSemestr(),
    nb_davr_from: '',
    nb_davr_to: '',
    hujjat_turi: option.hujjatTuri,
    bildirgi_chiqqan_sana: '',
    hemisdan_malumot_olingan_sana: '',
    fakultet: '',
    guruhlar_soni: '',
    talabalar_soni: '',
    jami_qoldirilgan_soat: '',
    ortacha_talaba_kesimida: '',
    kurslar_kesimida: '',
  }
}

export function wordsForHours(hours: HourOptionHours): string {
  return hourOptionByHours(hours).words
}

export { HOUR_OPTIONS }
