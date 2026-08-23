import { FileSpreadsheet, FileType, Trash2 } from 'lucide-react'
import { formatFileSize, formatUploadedAt } from '@/lib/files'
import type { StoredFile } from '@/types/files'

interface FileListProps {
  files: StoredFile[]
  emptyTitle: string
  emptyHint: string
  onRemove: (id: string) => void
}

export function FileList({
  files,
  emptyTitle,
  emptyHint,
  onRemove,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-ink-800">{emptyTitle}</p>
        <p className="mt-1 text-sm text-ink-400">{emptyHint}</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
      {files.map((item) => {
        const Icon = item.category === 'excel' ? FileSpreadsheet : FileType
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                item.category === 'excel'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-sky-50 text-sky-700'
              }`}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">
                {item.name}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                {formatFileSize(item.size)} · {formatUploadedAt(item.uploadedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`${item.name} ni o'chirish`}
            >
              <Trash2 size={16} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
