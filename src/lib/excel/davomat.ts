import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  EMPTY_TUTOR_LABEL,
  type DavomatParseResult,
  type DavomatStudent,
  type DavomatTutorGroup,
} from '@/types/davomat'

type DavomatField = keyof DavomatStudent

const COLUMN_ALIASES: Record<DavomatField, string[]> = {
  hemisId: [
    'talaba id',
    'talaba_id',
    'hemis_id',
    'hemis id',
    'student_id',
    'id',
  ],
  studentName: [
    'f.i.sh.',
    'f.i.sh',
    'fish',
    'f.i.o.',
    'full_name',
    'full name',
    'to‘liq ismi',
    "to'liq ismi",
    'fio',
  ],
  group: ['guruh', 'group', 'group_name', 'guruh nomi'],
  tutor: ['tyutor', 'tutor', 'tyutor_ismi'],
  faculty: ['fakultet', 'faculty', 'faculty_name'],
  specialty: ['mutaxassislik', 'specialty', 'specialization'],
  course: ['kurs', 'level', 'course'],
  educationForm: [
    "ta'lim shakli",
    'ta‘lim shakli',
    'talim shakli',
    'education_form',
    'education form',
  ],
  hours: ['sababsiz', 'soat', 'nb', 'hours'],
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function cellToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'number') {
    if (Number.isInteger(value) && Math.abs(value) >= 1e11) {
      return String(Math.trunc(value))
    }
    return String(value)
  }
  return String(value).trim()
}

function cellToHours(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  if (!match) return 0
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeCourse(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const digit = trimmed.match(/\d+/)
  if (!digit) return trimmed
  return `${digit[0]}-kurs`
}

function resolveColumnMap(
  headers: string[],
): Partial<Record<DavomatField, number>> {
  const map: Partial<Record<DavomatField, number>> = {}
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as Array<
    [DavomatField, string[]]
  >) {
    const index = headers.findIndex((header) => aliases.includes(header))
    if (index >= 0) map[field] = index
  }
  return map
}

export function groupByTutor(students: DavomatStudent[]): DavomatTutorGroup[] {
  const named = new Map<string, DavomatStudent[]>()
  const unnamed: DavomatStudent[] = []

  for (const student of students) {
    const tutor = student.tutor.trim()
    if (!tutor) {
      unnamed.push(student)
      continue
    }
    const list = named.get(tutor)
    if (list) list.push(student)
    else named.set(tutor, [student])
  }

  const groups: DavomatTutorGroup[] = [...named.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'uz'))
    .map(([tutorName, rows]) => ({ tutorName, students: rows }))

  if (unnamed.length > 0) {
    groups.push({ tutorName: EMPTY_TUTOR_LABEL, students: unnamed })
  }

  return groups
}

export function computeDavomatStats(
  students: DavomatStudent[],
): Pick<
  DavomatParseResult,
  | 'faculty'
  | 'guruhlar_soni'
  | 'talabalar_soni'
  | 'jami_qoldirilgan_soat'
  | 'ortacha_talaba_kesimida'
  | 'kurslar_kesimida'
> {
  const groups = new Set(students.map((student) => student.group).filter(Boolean))
  const totalHours = students.reduce((sum, student) => sum + student.hours, 0)
  const count = students.length
  const faculties = [
    ...new Set(students.map((student) => student.faculty).filter(Boolean)),
  ]

  const byCourse = new Map<string, number>()
  for (const student of students) {
    const course = student.course || 'kurs noma’lum'
    byCourse.set(course, (byCourse.get(course) ?? 0) + 1)
  }

  const courseLines = [...byCourse.entries()].sort((a, b) => {
    const na = Number(a[0].match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY)
    const nb = Number(b[0].match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY)
    if (na !== nb) return na - nb
    return a[0].localeCompare(b[0], 'uz')
  })

  return {
    faculty: faculties.join(', '),
    guruhlar_soni: groups.size,
    talabalar_soni: count,
    jami_qoldirilgan_soat: totalHours,
    ortacha_talaba_kesimida:
      count === 0 ? 0 : Math.round(totalHours / count),
    kurslar_kesimida: courseLines
      .map(([course, n]) => `${course} — ${n} nafar`)
      .join(', '),
  }
}

export async function parseDavomatExcel(file: File): Promise<DavomatParseResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('Excel faylida varaq topilmadi')
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  })

  if (rows.length < 2) {
    throw new Error('Excel faylida maʼlumot qatorlari yoʻq')
  }

  const headers = (rows[0] ?? []).map(normalizeHeader)
  const columnMap = resolveColumnMap(headers)

  if (
    columnMap.hemisId == null ||
    columnMap.studentName == null ||
    columnMap.group == null ||
    columnMap.hours == null
  ) {
    throw new Error(
      'Kerakli ustunlar topilmadi. TALABA ID, F.I.SH., GURUH va SABABSIZ bo‘lishi shart.',
    )
  }

  const students: DavomatStudent[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] ?? []
    const hemisId = cellToString(row[columnMap.hemisId])
    const studentName = cellToString(row[columnMap.studentName])
    if (!hemisId && !studentName) continue

    students.push({
      hemisId,
      studentName,
      group: cellToString(row[columnMap.group]),
      tutor:
        columnMap.tutor != null ? cellToString(row[columnMap.tutor]) : '',
      faculty:
        columnMap.faculty != null ? cellToString(row[columnMap.faculty]) : '',
      specialty:
        columnMap.specialty != null
          ? cellToString(row[columnMap.specialty])
          : '',
      course: normalizeCourse(
        columnMap.course != null ? cellToString(row[columnMap.course]) : '',
      ),
      educationForm:
        columnMap.educationForm != null
          ? cellToString(row[columnMap.educationForm])
          : '',
      hours: cellToHours(row[columnMap.hours]),
    })
  }

  if (students.length === 0) {
    throw new Error('Hech qanday talaba qatori o‘qilmadi')
  }

  return {
    fileName: file.name,
    students,
    tutors: groupByTutor(students),
    ...computeDavomatStats(students),
  }
}

const SAMPLE_HEADERS = [
  '№',
  'TALABA ID',
  'F.I.SH.',
  'GURUH',
  'TYUTOR',
  'FAKULTET',
  'MUTAXASSISLIK',
  'KURS',
  'TA\'LIM SHAKLI',
  'SABABSIZ',
]

const SAMPLE_ROWS = [
  [
    1,
    '464201111218',
    'BAXTIYAROV AZIZEK ANVARBEK O‘G‘LI',
    'AKT 26-5',
    'DO‘SMOV SHOKHRUH SHAMURATOVICH',
    'Iqtisodiyot fakulteti',
    'Axborot tizimlari va texnologiyalari',
    '1-kurs',
    'Kunduzgi',
    80,
  ],
  [
    2,
    '464201115756',
    'ERINOV AMIRBEK RAXIMBEK O‘G‘LI',
    'AKT 26-5',
    'DO‘SMOV SHOKHRUH SHAMURATOVICH',
    'Iqtisodiyot fakulteti',
    'Axborot tizimlari va texnologiyalari',
    '1-kurs',
    'Kunduzgi',
    68,
  ],
  [
    3,
    '464201100533',
    'ALIMOV ASADBEK IKTYOR O‘G‘LI',
    'IQT-24-1',
    '',
    'Iqtisodiyot fakulteti',
    'Iqtisodiyot',
    '3-kurs',
    'Kunduzgi',
    62,
  ],
]

export function downloadDavomatSampleExcel(): void {
  const sheet = XLSX.utils.aoa_to_sheet([SAMPLE_HEADERS, ...SAMPLE_ROWS])
  sheet['!cols'] = [
    { wch: 5 },
    { wch: 16 },
    { wch: 42 },
    { wch: 12 },
    { wch: 36 },
    { wch: 24 },
    { wch: 32 },
    { wch: 10 },
    { wch: 14 },
    { wch: 12 },
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Davomat')
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    'davomat-namuna.xlsx',
  )
}
