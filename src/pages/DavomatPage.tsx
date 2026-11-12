import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileType,
  Trash2,
} from 'lucide-react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { PageHeader } from '@/components/ui/PageHeader'
import { useUnloadGuard } from '@/hooks/useUnloadGuard'
import {
  academicYearOptions,
  defaultDavomatForm,
  formatNbDavr,
  formatUzLongDate,
  wordsForHours,
} from '@/lib/davomat/format'
import {
  downloadDavomatSampleExcel,
  parseDavomatExcel,
} from '@/lib/excel/davomat'
import { formatFileSize } from '@/lib/files'
import {
  DAVOMAT_TEMPLATE_NAME,
  DAVOMAT_TEMPLATE_PATH,
  downloadDavomatDocument,
} from '@/lib/word/davomat'
import { EXCEL_EXTENSIONS } from '@/types/files'
import {
  EMPTY_TUTOR_LABEL,
  HOUR_OPTIONS,
  hourOptionByHours,
  type DavomatForm,
  type DavomatParseResult,
  type HourOptionHours,
} from '@/types/davomat'

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-500">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400"
      />
      {hint ? (
        <span className="mt-1 block text-[11px] text-ink-400">{hint}</span>
      ) : null}
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function DateField({
  label,
  value,
  onChange,
  preview,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  preview?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-500">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400"
      />
      <span className="mt-1 block text-[11px] text-ink-400">
        {preview || 'Masalan: 2026-yil 21-oktabr'}
      </span>
    </label>
  )
}

export function DavomatPage() {
  const yearOptions = useMemo(() => academicYearOptions(), [])
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<DavomatParseResult | null>(null)
  const [form, setForm] = useState<DavomatForm>(defaultDavomatForm)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useUnloadGuard(parsed != null)

  function patchForm(patch: Partial<DavomatForm>) {
    setForm((current) => ({ ...current, ...patch }))
  }

  async function handleFiles(files: File[]) {
    const file = files[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls|xlsm)$/i)) {
      setParseError(
        `Qabul qilinmadi: ${file.name}. Faqat ${EXCEL_EXTENSIONS.join(', ')}.`,
      )
      setNotice(null)
      return
    }

    setParsing(true)
    setParseError(null)
    setNotice(null)
    setGenerateError(null)
    try {
      const result = await parseDavomatExcel(file)
      setExcelFile(file)
      setParsed(result)
      setForm((current) => ({
        ...current,
        fakultet: result.faculty,
        guruhlar_soni: String(result.guruhlar_soni),
        talabalar_soni: String(result.talabalar_soni),
        jami_qoldirilgan_soat: String(result.jami_qoldirilgan_soat),
        ortacha_talaba_kesimida: String(result.ortacha_talaba_kesimida),
        kurslar_kesimida: result.kurslar_kesimida,
      }))
      const unnamed = result.tutors.find(
        (group) => group.tutorName === EMPTY_TUTOR_LABEL,
      )
      const namedCount = result.tutors.length - (unnamed ? 1 : 0)
      setNotice(
        `${result.talabalar_soni} ta talaba, ${result.guruhlar_soni} ta guruh, ${namedCount} ta tyutor o‘qildi${unnamed ? `, tyutorsiz: ${unnamed.students.length}` : ''}.`,
      )
    } catch (err) {
      setExcelFile(null)
      setParsed(null)
      setParseError(
        err instanceof Error ? err.message : 'Excel o‘qishda xatolik',
      )
    } finally {
      setParsing(false)
    }
  }

  function handleClear() {
    setExcelFile(null)
    setParsed(null)
    setForm(defaultDavomatForm())
    setNotice(null)
    setParseError(null)
    setGenerateError(null)
  }

  function handleHourChange(value: string) {
    const hours = Number(value) as HourOptionHours
    const option = hourOptionByHours(hours)
    patchForm({
      ogohlantirish_soati: option.hours,
      hujjat_turi: option.hujjatTuri,
    })
  }

  async function handleDownload() {
    if (!parsed) return
    setGenerateError(null)
    setGenerating(true)
    try {
      await downloadDavomatDocument(form, parsed)
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : 'Word yaratishda xatolik yuz berdi',
      )
    } finally {
      setGenerating(false)
    }
  }

  const nbPreview = formatNbDavr(form.nb_davr_from, form.nb_davr_to)
  const hujjatOptions = HOUR_OPTIONS.map((option) => ({
    value: option.hujjatTuri,
    label: option.hujjatTuri,
  }))

  return (
    <div>
      <PageHeader
        title="Davomat ogohlantirish tayyorlash"
        description="Excel jadvalini yuklang, maydonlarni to‘ldiring va tyutor kesimidagi bildirgi Word faylini yuklab oling."
        action={
          parsed || excelFile ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              <Trash2 size={15} />
              Tozalash
            </button>
          ) : null
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-start gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <FileType size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">Word namuna</p>
            <p className="mt-0.5 truncate text-sm text-ink-500">
              {DAVOMAT_TEMPLATE_NAME}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 size={12} />
              Tayyor
            </span>
            <a
              href={DAVOMAT_TEMPLATE_PATH}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Ko‘rish
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={downloadDavomatSampleExcel}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-sm font-medium text-ink-700 hover:bg-ink-50 sm:w-64"
        >
          <FileSpreadsheet size={16} />
          Namuna Excel yuklab olish
        </button>
      </div>

      {!parsed ? (
        <FileDropzone
          accept=".xlsx,.xls,.xlsm"
          acceptLabel="XLSX, XLS, XLSM · TALABA ID, F.I.SH., GURUH, TYUTOR, SABABSIZ"
          title={parsing ? 'Excel o‘qilmoqda…' : 'Excel faylini yuklang'}
          onFiles={handleFiles}
          disabled={parsing}
        />
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileSpreadsheet size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">
              {parsed.fileName}
            </p>
            <p className="text-xs text-ink-400">
              {excelFile ? formatFileSize(excelFile.size) : null}
              {excelFile ? ' · ' : null}
              {parsed.talabalar_soni} talaba · {parsed.tutors.length} ilova
            </p>
          </div>
          <label className="cursor-pointer rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Almashtirish
            <input
              type="file"
              accept=".xlsx,.xls,.xlsm"
              className="sr-only"
              onChange={(e) => {
                const list = e.target.files
                if (list?.length) void handleFiles(Array.from(list))
                e.target.value = ''
              }}
            />
          </label>
        </div>
      )}

      {(notice || parseError) && (
        <div className="mt-4 space-y-2">
          {notice ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </p>
          ) : null}
          {parseError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {parseError}
            </p>
          ) : null}
        </div>
      )}

      {parsed ? (
        <>
          <section className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-ink-800">
              Tyutorlar ({parsed.tutors.length} ilova)
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {parsed.tutors.map((group) => (
                <li
                  key={group.tutorName}
                  className="rounded-xl border border-ink-200 bg-white px-3.5 py-3"
                >
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {group.tutorName}
                  </p>
                  <p className="text-xs text-ink-400">
                    {group.students.length} talaba ·{' '}
                    {group.students.reduce((sum, s) => sum + s.hours, 0)} soat
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-ink-200 bg-white px-4 py-5 sm:px-5">
            <p className="mb-4 text-xs font-semibold tracking-wide text-ink-400 uppercase">
              Bildirgi maydonlari
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Dekan (dekan_name)"
                value={form.dekan_name}
                onChange={(v) => patchForm({ dekan_name: v })}
                placeholder="E.Ibadullayev"
              />
              <SelectField
                label="Ogohlantirish soati"
                value={String(form.ogohlantirish_soati)}
                onChange={handleHourChange}
                options={HOUR_OPTIONS.map((option) => ({
                  value: String(option.hours),
                  label: option.words,
                }))}
              />
              <SelectField
                label="Hujjat turi"
                value={form.hujjat_turi}
                onChange={(v) => patchForm({ hujjat_turi: v })}
                options={hujjatOptions}
              />
              <SelectField
                label="O‘quv yili"
                value={form.oquv_yili}
                onChange={(v) => patchForm({ oquv_yili: v })}
                options={yearOptions.map((year) => ({
                  value: year,
                  label: year,
                }))}
              />
              <SelectField
                label="Semestr"
                value={form.semestr}
                onChange={(v) =>
                  patchForm({ semestr: v as DavomatForm['semestr'] })
                }
                options={[
                  { value: 'kuzgi', label: 'kuzgi' },
                  { value: 'bahorgi', label: 'bahorgi' },
                ]}
              />
              <Field
                label="Fakultet"
                value={form.fakultet}
                onChange={(v) => patchForm({ fakultet: v })}
              />
              <DateField
                label="NB davri — boshlanish"
                value={form.nb_davr_from}
                onChange={(v) => patchForm({ nb_davr_from: v })}
                preview={nbPreview}
              />
              <DateField
                label="NB davri — tugash"
                value={form.nb_davr_to}
                onChange={(v) => patchForm({ nb_davr_to: v })}
                preview={nbPreview}
              />
              <DateField
                label="Bildirgi chiqqan sana"
                value={form.bildirgi_chiqqan_sana}
                onChange={(v) => patchForm({ bildirgi_chiqqan_sana: v })}
                preview={formatUzLongDate(form.bildirgi_chiqqan_sana)}
              />
              <DateField
                label="HEMIS dan olingan sana"
                value={form.hemisdan_malumot_olingan_sana}
                onChange={(v) =>
                  patchForm({ hemisdan_malumot_olingan_sana: v })
                }
                preview={formatUzLongDate(form.hemisdan_malumot_olingan_sana)}
              />
              <Field
                label="Guruhlar soni"
                value={form.guruhlar_soni}
                onChange={(v) => patchForm({ guruhlar_soni: v })}
              />
              <Field
                label="Talabalar soni"
                value={form.talabalar_soni}
                onChange={(v) => patchForm({ talabalar_soni: v })}
              />
              <Field
                label="Jami qoldirilgan soat"
                value={form.jami_qoldirilgan_soat}
                onChange={(v) => patchForm({ jami_qoldirilgan_soat: v })}
              />
              <Field
                label="O‘rtacha (talaba kesimida)"
                value={form.ortacha_talaba_kesimida}
                onChange={(v) => patchForm({ ortacha_talaba_kesimida: v })}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Field
                  label="Kurslar kesimida"
                  value={form.kurslar_kesimida}
                  onChange={(v) => patchForm({ kurslar_kesimida: v })}
                  hint={`Soat matnda: ${wordsForHours(form.ogohlantirish_soati)}`}
                />
              </div>
            </div>

            {generateError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {generateError}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={generating}
                onClick={() => void handleDownload()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
              >
                <Download size={15} />
                {generating ? 'Yaratilmoqda…' : 'Word yuklab olish'}
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
