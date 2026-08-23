export interface StudentRow {
  hemisId: string
  studentName: string
  faculty: string
  level: string
  group: string
  semester: string
  specialtyCode: string
}

export interface StudentGroup {
  name: string
  students: StudentRow[]
  faculty: string
  specialtyCode: string
  level: string
  semester: string
  /** Default: "{level}-kurs {semester}-semestr" */
  cours: string
}

export interface ParseExcelResult {
  students: StudentRow[]
  groups: StudentGroup[]
  fileName: string
}

/** Address presets for the form */
export const ADDRESS_PRESETS = [
  'Xorazm viloyati, Urganch shahari, Islom Karimov ko‘chasi 110-uy',
  'Urganch shahar Ashxabod MFY, Sanoatchilar ko‘chasi 9-uy, 4-bino',
] as const

export interface TemplateSharedFields {
  createDate: string
  code: string
  startNum: number
  specialization: string
  duration: string
  address: string
  studyTime: string
  decanName: string
}

export interface TemplateGroupEntry {
  groupName: string
  facultyName: string
  specializationCode: string
  cours: string
  students: Array<{ hemisId: string; studentName: string }>
}

export interface DocumentTemplate {
  id: string
  name: string
  shared: TemplateSharedFields
  groups: TemplateGroupEntry[]
}

export function defaultSharedFields(): TemplateSharedFields {
  return {
    createDate: '',
    code: '',
    startNum: 1,
    specialization: '',
    duration: '',
    address: ADDRESS_PRESETS[0],
    studyTime: '',
    decanName: '',
  }
}

export function formatStartNum(n: number): string {
  const value = Math.max(0, Math.floor(n))
  return value < 1000 ? String(value).padStart(3, '0') : String(value)
}

export function buildCours(level: string, semester: string): string {
  const parts: string[] = []
  const levelPart = ensureUnitSuffix(level, 'kurs')
  const semesterPart = ensureUnitSuffix(semester, 'semestr')
  if (levelPart) parts.push(levelPart)
  if (semesterPart) parts.push(semesterPart)
  return parts.join(' ')
}

/** "2" | "2-kurs" | "2-kurs-kurs" → "2-kurs" */
function ensureUnitSuffix(value: string, suffix: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const stripRe = new RegExp(`(?:[\\s-]*${suffix})+$`, 'i')
  const base = trimmed.replace(stripRe, '').trim()
  if (!base) return `${trimmed.match(/\d+/)?.[0] ?? trimmed}-${suffix}`

  return `${base}-${suffix}`
}

/** "2026-08-24" → "24.08.2026" */
export function isoDateToDisplay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return ''
  const [, y, m, d] = match
  return `${d}.${m}.${y}`
}

/** "24.08.2026" → "2026-08-24" (for input[type=date]) */
export function displayDateToIso(display: string): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(display.trim())
  if (!match) return ''
  const [, d, m, y] = match
  return `${y}-${m}-${d}`
}

/** "14:00" or "14:00:00" → "14:00" */
export function normalizeTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim())
  if (!match) return ''
  const hours = match[1]!.padStart(2, '0')
  const minutes = match[2]!
  return `${hours}:${minutes}`
}

