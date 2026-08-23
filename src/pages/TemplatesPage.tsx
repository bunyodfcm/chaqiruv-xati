import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { FileList } from '@/components/ui/FileList'
import { PageHeader } from '@/components/ui/PageHeader'
import { useFiles } from '@/store/FilesContext'
import { TEMPLATE_EXTENSIONS } from '@/types/files'

export function TemplatesPage() {
  const { templateFiles, addFiles, removeFile, clearCategory } = useFiles()
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(files: File[]) {
    const result = addFiles(files, 'template')
    setNotice(
      result.added > 0
        ? `${result.added} ta Word shablon brauzer xotirasiga qo‘shildi.`
        : null,
    )
    setError(
      result.rejected.length > 0
        ? `Qabul qilinmadi: ${result.rejected.join(', ')}. Faqat ${TEMPLATE_EXTENSIONS.join(', ')}.`
        : null,
    )
  }

  return (
    <div>
      <PageHeader
        title="Word shablonlar"
        description="Hujjat andozasini yuklang. Shablon maydonlari keyinchalik Excel ustunlariga bog‘lanadi. Fayl faqat shu sessiyada qoladi."
        action={
          templateFiles.length > 0 ? (
            <button
              type="button"
              onClick={() => clearCategory('template')}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              <Trash2 size={15} />
              Hammasini tozalash
            </button>
          ) : null
        }
      />

      <FileDropzone
        accept=".docx,.doc"
        acceptLabel="DOCX, DOC · bir nechta shablon mumkin"
        title="Word shablonini yuklang"
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
          Yuklangan shablonlar
        </h3>
        <FileList
          files={templateFiles}
          emptyTitle="Shablon yo‘q"
          emptyHint="Avval .docx yoki .doc faylini yuqoriga tashlang."
          onRemove={removeFile}
        />
      </div>
    </div>
  )
}
