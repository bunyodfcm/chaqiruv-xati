import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import PizZip from 'pizzip'
import {
  BUILT_IN_TEMPLATE_PATH,
  BUILT_IN_TEMPLATE_NAME,
} from '@/lib/word/constants'
import {
  formatStartNum,
  type DocumentTemplate,
} from '@/types/prepare'

export { BUILT_IN_TEMPLATE_PATH, BUILT_IN_TEMPLATE_NAME }

export interface LetterPayload {
  create_date: string
  code: string
  start_num: string
  faculty_name: string
  specialization_code: string
  specialization: string
  cours: string
  duration: string
  address: string
  study_time: string
  group_name: string
  decan_name: string
  last: boolean
  students: Array<{
    index: number
    hemis_id: string
    student_name: string
  }>
}

export function buildLettersPayload(template: DocumentTemplate): LetterPayload[] {
  const { shared, groups } = template
  return groups.map((group, index) => ({
    create_date: shared.createDate,
    code: shared.code,
    start_num: formatStartNum(shared.startNum + index),
    faculty_name: group.facultyName,
    specialization_code: group.specializationCode,
    specialization: shared.specialization,
    cours: group.cours,
    duration: shared.duration,
    address: shared.address,
    study_time: shared.studyTime,
    group_name: group.groupName,
    decan_name: shared.decanName,
    last: index === groups.length - 1,
    students: group.students.map((student, studentIndex) => ({
      index: studentIndex + 1,
      hemis_id: student.hemisId,
      student_name: student.studentName,
    })),
  }))
}

async function loadTemplateArrayBuffer(): Promise<ArrayBuffer> {
  const response = await fetch(BUILT_IN_TEMPLATE_PATH)
  if (!response.ok) {
    throw new Error('Word namuna yuklanmadi')
  }
  return response.arrayBuffer()
}

export async function generateWordDocument(
  template: DocumentTemplate,
): Promise<Blob> {
  if (template.groups.length === 0) {
    throw new Error('Shablonga kamida bitta guruh qo‘shing')
  }

  const content = await loadTemplateArrayBuffer()
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  })

  doc.render({
    letters: buildLettersPayload(template),
  })

  return doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export async function downloadWordDocument(
  template: DocumentTemplate,
): Promise<void> {
  const blob = await generateWordDocument(template)
  const safeName = template.name.replace(/[^\w-]+/g, '_') || 'chaqiruv'
  saveAs(blob, `${safeName}.docx`)
}
