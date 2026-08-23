import { useState } from 'react'
import { CheckCircle2, FileSpreadsheet, FileType, Plus, Trash2 } from 'lucide-react'
import { GroupList } from '@/components/prepare/GroupList'
import { TemplateCard } from '@/components/prepare/TemplateCard'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { PageHeader } from '@/components/ui/PageHeader'
import { useUnloadGuard } from '@/hooks/useUnloadGuard'
import { parseExcelFile } from '@/lib/excel'
import { formatFileSize } from '@/lib/files'
import {
  BUILT_IN_TEMPLATE_NAME,
  BUILT_IN_TEMPLATE_PATH,
} from '@/lib/word/constants'
import { useFiles } from '@/store/FilesContext'
import { usePrepare } from '@/store/PrepareContext'
import { EXCEL_EXTENSIONS } from '@/types/files'

export function PreparePage() {
  const { excelFiles, addFiles, clearCategory } = useFiles()
  const {
    fileName,
    groups,
    templates,
    parsing,
    parseError,
    setParsedData,
    setParsing,
    setParseError,
    clearExcel,
    createTemplate,
  } = usePrepare()
  const [notice, setNotice] = useState<string | null>(null)

  useUnloadGuard(groups.length > 0 || templates.length > 0)

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

    clearCategory('excel')
    addFiles([file], 'excel')

    setParsing(true)
    setParseError(null)
    setNotice(null)
    try {
      const parsed = await parseExcelFile(file)
      setParsedData(parsed.fileName, parsed.groups)
      setNotice(
        `${parsed.groups.length} ta guruh, ${parsed.students.length} ta talaba o‘qildi.`,
      )
    } catch (err) {
      clearExcel()
      clearCategory('excel')
      setParseError(
        err instanceof Error ? err.message : 'Excel o‘qishda xatolik',
      )
    } finally {
      setParsing(false)
    }
  }

  function handleClear() {
    clearCategory('excel')
    clearExcel()
    setNotice(null)
  }

  const excelFile = excelFiles[0]

  return (
    <div>
      <PageHeader
        title="Chaqiruv xati tayyorlash"
        description="Excel jadvalini yuklang, guruhlarni tanlang va Word shablon yarating. Word namuna dasturga o‘rnatilgan."
        action={
          groups.length > 0 || excelFile ? (
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

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <FileType size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">Word namuna</p>
          <p className="mt-0.5 truncate text-sm text-ink-500">
            {BUILT_IN_TEMPLATE_NAME}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 size={12} />
            Tayyor
          </span>
          <a
            href={BUILT_IN_TEMPLATE_PATH}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Ko‘rish
          </a>
        </div>
      </div>

      {groups.length === 0 ? (
        <FileDropzone
          accept=".xlsx,.xls,.xlsm"
          acceptLabel="XLSX, XLS, XLSM · bitta fayl"
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
              {fileName ?? excelFile?.name}
            </p>
            <p className="text-xs text-ink-400">
              {excelFile ? formatFileSize(excelFile.size) : null}
              {excelFile ? ' · ' : null}
              {groups.length} guruh o‘qildi
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

      <GroupList groups={groups} />

      {groups.length > 0 ? (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink-800">
                Shablonlar
              </h3>
              <p className="text-xs text-ink-400">
                Har bir shablon — bitta Word fayl (ichida bir nechta guruh
                ketma-ket)
              </p>
            </div>
            <button
              type="button"
              onClick={createTemplate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Plus size={16} />
              Shablon yaratish
            </button>
          </div>

          {templates.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-10 text-center text-sm text-ink-400">
              «Shablon yaratish» tugmasini bosing, keyin kerakli guruhlarni
              qo‘shing.
            </p>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  availableGroups={groups}
                />
              ))}
            </div>
          )}

          {templates.length > 0 ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={createTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                <Plus size={16} />
                Yana shablon yaratish
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
