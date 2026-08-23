export type FileCategory = 'excel' | 'template'

export interface StoredFile {
  id: string
  name: string
  size: number
  mimeType: string
  lastModified: number
  uploadedAt: number
  category: FileCategory
  file: File
}

export const EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.xlsm'] as const
export const TEMPLATE_EXTENSIONS = ['.docx', '.doc'] as const
