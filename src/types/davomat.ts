export const EMPTY_TUTOR_LABEL = 'Tyutor biriktirilmagan'

export const HOUR_OPTIONS = [
  {
    hours: 18,
    words: '18 (o‘n sakkiz)',
    hujjatTuri: 'ogohlantirish',
  },
  {
    hours: 30,
    words: '30 (o‘ttiz)',
    hujjatTuri: 'qat’iy ogohlantirish (hayfsan)',
  },
] as const

export type HourOptionHours = (typeof HOUR_OPTIONS)[number]['hours']
export type Semestr = 'kuzgi' | 'bahorgi'

export interface DavomatStudent {
  hemisId: string
  studentName: string
  group: string
  tutor: string
  faculty: string
  specialty: string
  course: string
  educationForm: string
  hours: number
}

export interface DavomatTutorGroup {
  tutorName: string
  students: DavomatStudent[]
}

export interface DavomatParseResult {
  fileName: string
  students: DavomatStudent[]
  tutors: DavomatTutorGroup[]
  faculty: string
  guruhlar_soni: number
  talabalar_soni: number
  jami_qoldirilgan_soat: number
  ortacha_talaba_kesimida: number
  kurslar_kesimida: string
}

export interface DavomatForm {
  dekan_name: string
  ogohlantirish_soati: HourOptionHours
  oquv_yili: string
  semestr: Semestr
  nb_davr_from: string
  nb_davr_to: string
  hujjat_turi: string
  bildirgi_chiqqan_sana: string
  hemisdan_malumot_olingan_sana: string
  fakultet: string
  guruhlar_soni: string
  talabalar_soni: string
  jami_qoldirilgan_soat: string
  ortacha_talaba_kesimida: string
  kurslar_kesimida: string
}

export function hourOptionByHours(hours: HourOptionHours) {
  return HOUR_OPTIONS.find((option) => option.hours === hours) ?? HOUR_OPTIONS[1]
}
