import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { UploadCloud } from 'lucide-react'

interface FileDropzoneProps {
  accept: string
  acceptLabel: string
  title: string
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export function FileDropzone({
  accept,
  acceptLabel,
  title,
  onFiles,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(fileList: FileList | File[] | null) {
    if (!fileList || disabled) return
    const files = Array.from(fileList)
    if (files.length > 0) onFiles(files)
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        disabled
          ? 'cursor-not-allowed border-ink-200 bg-ink-50 opacity-70'
          : isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <UploadCloud size={22} />
      </div>
      <p className="mt-4 text-[15px] font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">
        Faylni shu yerga tashlang yoki tanlash uchun bosing
      </p>
      <p className="mt-3 text-xs text-ink-400">{acceptLabel}</p>
    </div>
  )
}
