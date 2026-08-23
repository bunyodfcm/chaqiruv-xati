import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { FileList } from '@/components/ui/FileList'
import { PageHeader } from '@/components/ui/PageHeader'
import { useFiles } from '@/store/FilesContext'
import { EXCEL_EXTENSIONS } from '@/types/files'

export function ExcelPage() {
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
        title="Excel ma'lumotlari"
        description="Chaqiruv xatlari uchun asosiy jadvalni yuklang. Fayl o‘qilmaydi va serverga yuborilmaydi — keyingi taskda parse qilinadi."
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
