import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileOutput,
  FileSpreadsheet,
  FileType,
  Lock,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { useFiles } from '@/store/FilesContext'
import { formatFileSize, formatUploadedAt } from '@/lib/files'

const STEPS = [
  {
    title: 'Excel fayl yuklang',
    text: 'Chaqiruvlar uchun asosiy ma\'lumotlar jadvali.',
    to: '/excel',
    doneKey: 'excel' as const,
  },
  {
    title: 'Word shablon qo\'shing',
    text: 'Hujjat ko\'rinishi va maydonlar joylashuvi.',
    to: '/shablonlar',
    doneKey: 'template' as const,
  },
  {
    title: 'Hujjatlarni yarating',
    text: 'Excel qatorlari asosida Word fayllar chiqariladi.',
    to: '/hujjatlar',
    doneKey: 'generate' as const,
  },
]

export function DashboardPage() {
  const { excelFiles, templateFiles, files } = useFiles()
  const recent = files.slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Xush kelibsiz"
        description="Excel jadvallari asosida Word hujjatlar tayyorlash uchun interfeys. Hozircha fayllarni yuklash va loyiha tuzilmasi tayyor — generatsiya keyingi bosqichda qo'shiladi."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Excel fayllar"
          value={excelFiles.length}
          hint="Brauzer xotirasida saqlanmoqda"
          icon={FileSpreadsheet}
        />
        <StatCard
          label="Word shablonlar"
          value={templateFiles.length}
          hint="Hujjat andozalari"
          icon={FileType}
        />
        <StatCard
          label="Tayyor hujjatlar"
          value={0}
          hint="Generatsiya hali ulanmagan"
          icon={FileOutput}
          tone="muted"
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="text-sm font-semibold text-ink-900">Ish jarayoni</h3>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => {
              const done =
                step.doneKey === 'excel'
                  ? excelFiles.length > 0
                  : step.doneKey === 'template'
                    ? templateFiles.length > 0
                    : false
              const locked = step.doneKey === 'generate'

              return (
                <li key={step.title}>
                  <Link
                    to={step.to}
                    className="flex items-start gap-3 rounded-xl border border-ink-100 px-3 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                  >
                    <span className="mt-0.5 text-brand-600">
                      {locked ? (
                        <Lock size={18} />
                      ) : done ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink-400">
                          0{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-ink-900">
                          {step.title}
                        </span>
                        {locked ? (
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500">
                            Keyingi task
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-500">
                        {step.text}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="mt-1 shrink-0 text-ink-300"
                    />
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="text-sm font-semibold text-ink-900">
            So‘nggi fayllar
          </h3>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">
              Hali hech narsa yuklanmagan. Excel yoki Word sahifasidan boshlang.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recent.map((file) => (
                <li key={file.id} className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-ink-400">
                    {file.category === 'excel' ? 'Excel' : 'Shablon'} ·{' '}
                    {formatFileSize(file.size)} ·{' '}
                    {formatUploadedAt(file.uploadedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
