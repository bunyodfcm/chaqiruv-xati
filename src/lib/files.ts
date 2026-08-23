import {
  EXCEL_EXTENSIONS,
  TEMPLATE_EXTENSIONS,
  type FileCategory,
} from '@/types/files'

export function getFileExtension(name: string): string {
  const index = name.lastIndexOf('.')
  if (index < 0) return ''
  return name.slice(index).toLowerCase()
}

export function isAllowedFile(name: string, category: FileCategory): boolean {
  const extension = getFileExtension(name)
  if (category === 'excel') {
    return (EXCEL_EXTENSIONS as readonly string[]).includes(extension)
  }
  return (TEMPLATE_EXTENSIONS as readonly string[]).includes(extension)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** exponent
  const digits = value >= 10 || exponent === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${units[exponent]}`
}

export function formatUploadedAt(timestamp: number): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function createFileId(): string {
  return crypto.randomUUID()
}
