import { useState } from 'react'
import { CheckCircle2, FileType, Trash2 } from 'lucide-react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { FileList } from '@/components/ui/FileList'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  BUILT_IN_TEMPLATE_NAME,
  BUILT_IN_TEMPLATE_PATH,
} from '@/lib/word'
import { useFiles } from '@/store/FilesContext'
import { EXCEL_EXTENSIONS } from '@/types/files'

export function PreparePage() {
  const { excelFiles, addFiles, removeFile, clearCategory } = useFiles()
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(files: File[]) {
    const result = addFiles(files, 'excel')
    setNotice(
      result.added > 0
        ? `${result.added} ta Excel fayl brauzer xotirasiga qo‘shildi.`
        : null,
    )
    setError(
      result.rejected.length > 0
        ? `Qabul qilinmadi: ${result.rejected.join(', ')}. Faqat ${EXCEL_EXTENSIONS.join(', ')}.`
        : null,
    )
  }

  return (
    <div>
      <PageHeader
        title="Chaqiruv xati tayyorlash"
        description="Excel jadvalini yuklang. Word namuna dasturga o‘rnatilgan — alohida yuklash shart emas."
        action={
          excelFiles.length > 0 ? (
            <button
              type="button"
              onClick={() => clearCategory('excel')}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              <Trash2 size={15} />
              Hammasini tozalash
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

      <FileDropzone
        accept=".xlsx,.xls,.xlsm"
        acceptLabel="XLSX, XLS, XLSM · bir nechta fayl mumkin"
        title="Excel faylini yuklang"
        onFiles={handleFiles}
      />

      {(notice || error) && (
        <div className="mt-4 space-y-2">
          {notice ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">
          Yuklangan jadvallar
        </h3>
        <FileList
          files={excelFiles}
          emptyTitle="Excel fayl yo‘q"
          emptyHint="Avval .xlsx yoki .xls faylini yuqoriga tashlang."
          onRemove={removeFile}
        />
      </div>
    </div>
  )
}
