import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createFileId } from '@/lib/files'
import {
  defaultSharedFields,
  type DocumentTemplate,
  type StudentGroup,
  type TemplateGroupEntry,
  type TemplateSharedFields,
} from '@/types/prepare'

interface PrepareContextValue {
  fileName: string | null
  groups: StudentGroup[]
  templates: DocumentTemplate[]
  parsing: boolean
  parseError: string | null
  setParsedData: (fileName: string, groups: StudentGroup[]) => void
  setParsing: (value: boolean) => void
  setParseError: (message: string | null) => void
  clearExcel: () => void
  createTemplate: () => void
  removeTemplate: (id: string) => void
  updateShared: (id: string, patch: Partial<TemplateSharedFields>) => void
  addGroupsToTemplate: (templateId: string, groupNames: string[]) => void
  removeGroupFromTemplate: (templateId: string, groupName: string) => void
  updateTemplateGroup: (
    templateId: string,
    groupName: string,
    patch: Partial<
      Pick<
        TemplateGroupEntry,
        'facultyName' | 'specializationCode' | 'cours'
      >
    >,
  ) => void
}

const PrepareContext = createContext<PrepareContextValue | null>(null)

function groupToEntry(group: StudentGroup): TemplateGroupEntry {
  return {
    groupName: group.name,
    facultyName: group.faculty,
    specializationCode: group.specialtyCode,
    cours: group.cours,
    students: group.students.map((s) => ({
      hemisId: s.hemisId,
      studentName: s.studentName,
    })),
  }
}

export function PrepareProvider({ children }: { children: ReactNode }) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const setParsedData = useCallback(
    (name: string, nextGroups: StudentGroup[]) => {
      setFileName(name)
      setGroups(nextGroups)
      setTemplates([])
      setParseError(null)
    },
    [],
  )

  const clearExcel = useCallback(() => {
    setFileName(null)
    setGroups([])
    setTemplates([])
    setParseError(null)
  }, [])

  const createTemplate = useCallback(() => {
    setTemplates((current) => [
      ...current,
      {
        id: createFileId(),
        name: `Shablon ${current.length + 1}`,
        shared: defaultSharedFields(),
        groups: [],
      },
    ])
  }, [])

  const removeTemplate = useCallback((id: string) => {
    setTemplates((current) => current.filter((t) => t.id !== id))
  }, [])

  const updateShared = useCallback(
    (id: string, patch: Partial<TemplateSharedFields>) => {
      setTemplates((current) =>
        current.map((t) =>
          t.id === id ? { ...t, shared: { ...t.shared, ...patch } } : t,
        ),
      )
    },
    [],
  )

  const addGroupsToTemplate = useCallback(
    (templateId: string, groupNames: string[]) => {
      setTemplates((current) =>
        current.map((t) => {
          if (t.id !== templateId) return t
          const existing = new Set(t.groups.map((g) => g.groupName))
          const toAdd = groupNames
            .filter((name) => !existing.has(name))
            .map((name) => groups.find((g) => g.name === name))
            .filter((g): g is StudentGroup => Boolean(g))
            .map(groupToEntry)
          return { ...t, groups: [...t.groups, ...toAdd] }
        }),
      )
    },
    [groups],
  )

  const removeGroupFromTemplate = useCallback(
    (templateId: string, groupName: string) => {
      setTemplates((current) =>
        current.map((t) =>
          t.id === templateId
            ? {
                ...t,
                groups: t.groups.filter((g) => g.groupName !== groupName),
              }
            : t,
        ),
      )
    },
    [],
  )

  const updateTemplateGroup = useCallback(
    (
      templateId: string,
      groupName: string,
      patch: Partial<
        Pick<
          TemplateGroupEntry,
          'facultyName' | 'specializationCode' | 'cours'
        >
      >,
    ) => {
      setTemplates((current) =>
        current.map((t) => {
          if (t.id !== templateId) return t
          return {
            ...t,
            groups: t.groups.map((g) =>
              g.groupName === groupName ? { ...g, ...patch } : g,
            ),
          }
        }),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({
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
      removeTemplate,
      updateShared,
      addGroupsToTemplate,
      removeGroupFromTemplate,
      updateTemplateGroup,
    }),
    [
      fileName,
      groups,
      templates,
      parsing,
      parseError,
      setParsedData,
      clearExcel,
      createTemplate,
      removeTemplate,
      updateShared,
      addGroupsToTemplate,
      removeGroupFromTemplate,
      updateTemplateGroup,
    ],
  )

  return (
    <PrepareContext.Provider value={value}>{children}</PrepareContext.Provider>
  )
}

export function usePrepare() {
  const context = useContext(PrepareContext)
  if (!context) {
    throw new Error('usePrepare PrepareProvider ichida ishlatilishi kerak')
  }
  return context
}
