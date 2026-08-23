import * as XLSX from 'xlsx'
import {
  buildCours,
  type ParseExcelResult,
  type StudentGroup,
  type StudentRow,
} from '@/types/prepare'

/** Canonical field → possible header names (lowercased, trimmed) */
const COLUMN_ALIASES: Record<keyof StudentRow, string[]> = {
  hemisId: ['hemis_id', 'hemis id', 'talaba id', 'talaba_id', 'student_id'],
  studentName: [
    'full_name',
    'full name',
    'to‘liq ismi',
    "to'liq ismi",
    'tolik ismi',
    'student_name',
    'fio',
  ],
  faculty: ['faculty', 'fakultet', 'faculty_name'],
  level: ['level', 'kurs', 'course'],
  group: ['group', 'guruh', 'group_name', 'guruh nomi'],
  semester: ['semester', 'semestr'],
  specialtyCode: [
    'specialty_code',
    'specialty code',
    'mutaxassislik',
    'specialization_code',
    'specialty',
  ],
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
    // Avoid scientific notation for long IDs
    if (Number.isInteger(value) && Math.abs(value) >= 1e11) {
      return String(Math.trunc(value))
    }
    return String(value)
  }
  return String(value).trim()
}

function resolveColumnMap(
  headers: string[],
): Partial<Record<keyof StudentRow, number>> {
  const map: Partial<Record<keyof StudentRow, number>> = {}

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as Array<
    [keyof StudentRow, string[]]
  >) {
    const index = headers.findIndex((h) => aliases.includes(h))
    if (index >= 0) map[field] = index
  }

  return map
}

function requiredColumnsPresent(
  map: Partial<Record<keyof StudentRow, number>>,
): boolean {
  return (
    map.hemisId != null &&
    map.studentName != null &&
    map.group != null
  )
}

export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
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
    raw: false,
  })

  if (rows.length < 2) {
    throw new Error('Excel faylida maʼlumot qatorlari yoʻq')
  }

  const headers = (rows[0] ?? []).map(normalizeHeader)
  const columnMap = resolveColumnMap(headers)

  if (!requiredColumnsPresent(columnMap)) {
    throw new Error(
      'Kerakli ustunlar topilmadi. hemis_id, full_name va group (yoki oʻzbekcha nomlari) boʻlishi shart.',
    )
  }

  const students: StudentRow[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] ?? []
    const hemisId = cellToString(row[columnMap.hemisId!])
    const group = cellToString(row[columnMap.group!])
    if (!hemisId || !group) continue

    students.push({
      hemisId,
      studentName: cellToString(row[columnMap.studentName!]),
      faculty:
        columnMap.faculty != null ? cellToString(row[columnMap.faculty]) : '',
      level: columnMap.level != null ? cellToString(row[columnMap.level]) : '',
      group,
      semester:
        columnMap.semester != null
          ? cellToString(row[columnMap.semester])
          : '',
      specialtyCode:
        columnMap.specialtyCode != null
          ? cellToString(row[columnMap.specialtyCode])
          : '',
    })
  }

  if (students.length === 0) {
    throw new Error('Hech qanday talaba qatori o‘qilmadi')
  }

  return {
    students,
    groups: groupStudents(students),
    fileName: file.name,
  }
}

export function groupStudents(students: StudentRow[]): StudentGroup[] {
  const byGroup = new Map<string, StudentRow[]>()

  for (const student of students) {
    const list = byGroup.get(student.group)
    if (list) list.push(student)
    else byGroup.set(student.group, [student])
  }

  const groups: StudentGroup[] = []
  for (const [name, rows] of byGroup) {
    const first = rows[0]!
    groups.push({
      name,
      students: rows,
      faculty: first.faculty,
      specialtyCode: first.specialtyCode,
      level: first.level,
      semester: first.semester,
      cours: buildCours(first.level, first.semester),
    })
  }

  groups.sort((a, b) => a.name.localeCompare(b.name, 'uz'))
  return groups
}
