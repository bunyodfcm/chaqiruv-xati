import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createFileId, isAllowedFile } from '@/lib/files'
import type { FileCategory, StoredFile } from '@/types/files'

interface AddFilesResult {
  added: number
  rejected: string[]
}

interface FilesContextValue {
  files: StoredFile[]
  excelFiles: StoredFile[]
  templateFiles: StoredFile[]
  addFiles: (fileList: File[], category: FileCategory) => AddFilesResult
  removeFile: (id: string) => void
  clearCategory: (category: FileCategory) => void
}

const FilesContext = createContext<FilesContextValue | null>(null)

export function FilesProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<StoredFile[]>([])

  const addFiles = useCallback(
    (fileList: File[], category: FileCategory): AddFilesResult => {
      const rejected: string[] = []
      const incoming: StoredFile[] = []

      for (const file of fileList) {
        if (!isAllowedFile(file.name, category)) {
          rejected.push(file.name)
          continue
        }

        incoming.push({
          id: createFileId(),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          lastModified: file.lastModified,
          uploadedAt: Date.now(),
          category,
          file,
        })
      }

      if (incoming.length > 0) {
        setFiles((current) => [...incoming, ...current])
      }

      return { added: incoming.length, rejected }
    },
    [],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id))
  }, [])

  const clearCategory = useCallback((category: FileCategory) => {
    setFiles((current) => current.filter((item) => item.category !== category))
  }, [])

  const excelFiles = useMemo(
    () => files.filter((item) => item.category === 'excel'),
    [files],
  )

  const templateFiles = useMemo(
    () => files.filter((item) => item.category === 'template'),
    [files],
  )

  const value = useMemo(
    () => ({
      files,
      excelFiles,
      templateFiles,
      addFiles,
      removeFile,
      clearCategory,
    }),
    [files, excelFiles, templateFiles, addFiles, removeFile, clearCategory],
  )

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>
}

export function useFiles() {
  const context = useContext(FilesContext)
  if (!context) {
    throw new Error('useFiles FilesProvider ichida ishlatilishi kerak')
  }
  return context
}
