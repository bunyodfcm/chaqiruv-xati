import { Link } from 'react-router-dom'
import { FileOutput, Lock } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { useFiles } from '@/store/FilesContext'

const PIPELINE = [
  { label: 'Excel', ready: true },
  { label: 'Parse', ready: false },
  { label: 'Maydonlar', ready: false },
  { label: 'Word', ready: false },
  { label: 'Yuklab olish', ready: false },
]

export function DocumentsPage() {
  const { excelFiles, templateFiles } = useFiles()
  const canPrepare = excelFiles.length > 0 && templateFiles.length > 0

  return (
    <div>
      <PageHeader
        title="Hujjatlar"
        description="Bu sahifa Excel qatorlaridan Word hujjatlar yaratish uchun mo‘ljallangan. Generatsiya logikasi hozircha ulanmagan."
      />

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="border-b border-ink-100 bg-ink-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
            Rejalashtirilgan oqim
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {PIPELINE.map((step, index) => (
              <div key={step.label} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    step.ready
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-white text-ink-400 ring-1 ring-ink-200'
                  }`}
                >
                  {step.label}
                </span>
                {index < PIPELINE.length - 1 ? (
                  <span className="text-ink-300">→</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
            <Lock size={22} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">
            Generatsiya keyingi taskda
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Excel va Word bilan ishlash brauzer ichida amalga oshiriladi. Hozir
            faqat fayllarni tanlash va saqlash tayyor.
          </p>

          <dl className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
              <dt className="text-xs text-ink-400">Excel fayllar</dt>
              <dd className="mt-1 text-sm font-semibold text-ink-900">
                {excelFiles.length} ta yuklangan
              </dd>
            </div>
            <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
              <dt className="text-xs text-ink-400">Word shablonlar</dt>
              <dd className="mt-1 text-sm font-semibold text-ink-900">
                {templateFiles.length} ta yuklangan
              </dd>
            </div>
          </dl>

          <button
            type="button"
            disabled
            className="mt-8 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-500"
          >
            <FileOutput size={16} />
            Hujjatlarni yaratish
          </button>

          {!canPrepare ? (
            <p className="mt-4 text-xs text-ink-400">
              Avval{' '}
              <Link to="/excel" className="font-medium text-brand-600">
                Excel
              </Link>{' '}
              va{' '}
              <Link to="/shablonlar" className="font-medium text-brand-600">
                shablon
              </Link>{' '}
              yuklang — keyingi bosqichda shu yerda ishlatiladi.
            </p>
          ) : (
            <p className="mt-4 text-xs text-ink-400">
              Fayllar tayyor. Parse va generatsiya keyingi taskda ulanadi.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
