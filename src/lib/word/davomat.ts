import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import PizZip from 'pizzip'
import {
  formatNbDavr,
  formatUzLongDate,
  wordsForHours,
} from '@/lib/davomat/format'
import {
  DAVOMAT_TEMPLATE_NAME,
  DAVOMAT_TEMPLATE_PATH,
} from '@/lib/word/constants'
import type {
  DavomatForm,
  DavomatParseResult,
  DavomatTutorGroup,
} from '@/types/davomat'
import { hourOptionByHours } from '@/types/davomat'

export interface DavomatStudentPayload {
  num: number
  fullname: string
  hemis_id: string
  group: string
  cours: string
  hour: number
}

export interface DavomatIlovaPayload {
  tyutor_ismi: string
  jadvaldagi_talabalar_soni: number
  jqs: number
  talabalar: DavomatStudentPayload[]
}

export interface DavomatDocumentPayload {
  dekan_name: string
  fakultet: string
  ogohlantirish_soati: number
  ogohlantirish_soati_soz_bilan: string
  oquv_yili: string
  semestr: string
  nb_davr: string
  guruhlar_soni: string
  talabalar_soni: string
  jami_qoldirilgan_soat: string
  ortacha_talaba_kesimida: string
  kurslar_kesimida: string
  hujjat_turi: string
  bildirgi_chiqqan_sana: string
  hemisdan_malumot_olingan_sana: string
  ilovalar: DavomatIlovaPayload[]
}

function asNatural(value: string, fallback: number): string {
  const trimmed = value.trim()
  if (trimmed) return trimmed
  return String(fallback)
}

export function buildIlovalar(
  tutors: DavomatTutorGroup[],
): DavomatIlovaPayload[] {
  return tutors.map((group) => ({
    tyutor_ismi: group.tutorName,
    jadvaldagi_talabalar_soni: group.students.length,
    jqs: group.students.reduce((sum, student) => sum + student.hours, 0),
    talabalar: group.students.map((student, index) => ({
      num: index + 1,
      fullname: student.studentName,
      hemis_id: student.hemisId,
      group: student.group,
      cours: student.course,
      hour: student.hours,
    })),
  }))
}

export function buildDavomatPayload(
  form: DavomatForm,
  parsed: DavomatParseResult,
): DavomatDocumentPayload {
  const option = hourOptionByHours(form.ogohlantirish_soati)
  const nbDavr = formatNbDavr(form.nb_davr_from, form.nb_davr_to)
  if (!nbDavr) {
    throw new Error('NB davri uchun boshlanish va tugash sanalarini tanlang')
  }
  const bildirgi = formatUzLongDate(form.bildirgi_chiqqan_sana)
  if (!bildirgi) {
    throw new Error('Bildirgi chiqqan sanani tanlang')
  }
  const hemisSana = formatUzLongDate(form.hemisdan_malumot_olingan_sana)
  if (!hemisSana) {
    throw new Error('HEMIS dan ma’lumot olingan sanani tanlang')
  }
  if (!form.dekan_name.trim()) {
    throw new Error('Dekan ismini kiriting')
  }
  if (parsed.students.length === 0) {
    throw new Error('Excelda talaba yo‘q')
  }

  return {
    dekan_name: form.dekan_name.trim(),
    fakultet: form.fakultet.trim() || parsed.faculty,
    ogohlantirish_soati: form.ogohlantirish_soati,
    ogohlantirish_soati_soz_bilan: wordsForHours(form.ogohlantirish_soati),
    oquv_yili: form.oquv_yili,
    semestr: form.semestr,
    nb_davr: nbDavr,
    guruhlar_soni: asNatural(form.guruhlar_soni, parsed.guruhlar_soni),
    talabalar_soni: asNatural(form.talabalar_soni, parsed.talabalar_soni),
    jami_qoldirilgan_soat: asNatural(
      form.jami_qoldirilgan_soat,
      parsed.jami_qoldirilgan_soat,
    ),
    ortacha_talaba_kesimida: asNatural(
      form.ortacha_talaba_kesimida,
      parsed.ortacha_talaba_kesimida,
    ),
    kurslar_kesimida: form.kurslar_kesimida.trim() || parsed.kurslar_kesimida,
    hujjat_turi: form.hujjat_turi.trim() || option.hujjatTuri,
    bildirgi_chiqqan_sana: bildirgi,
    hemisdan_malumot_olingan_sana: hemisSana,
    ilovalar: buildIlovalar(parsed.tutors),
  }
}

async function loadTemplateArrayBuffer(): Promise<ArrayBuffer> {
  const response = await fetch(DAVOMAT_TEMPLATE_PATH)
  if (!response.ok) {
    throw new Error('Davomat Word namuna yuklanmadi')
  }
  return response.arrayBuffer()
}

export async function generateDavomatDocument(
  form: DavomatForm,
  parsed: DavomatParseResult,
): Promise<Blob> {
  const payload = buildDavomatPayload(form, parsed)
  const content = await loadTemplateArrayBuffer()
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  })
  doc.render(payload)
  return doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export async function downloadDavomatDocument(
  form: DavomatForm,
  parsed: DavomatParseResult,
): Promise<void> {
  const blob = await generateDavomatDocument(form, parsed)
  const safeYear = form.oquv_yili.replaceAll('/', '-')
  saveAs(blob, `davomat-ogohlantirish-${safeYear}.docx`)
}

export { DAVOMAT_TEMPLATE_NAME, DAVOMAT_TEMPLATE_PATH }
