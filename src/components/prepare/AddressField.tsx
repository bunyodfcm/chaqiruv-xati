import { ADDRESS_PRESETS } from '@/types/prepare'

interface AddressFieldProps {
  value: string
  onChange: (value: string) => void
}

export function AddressField({ value, onChange }: AddressFieldProps) {
  const isPreset = (ADDRESS_PRESETS as readonly string[]).includes(value)
  const mode = isPreset ? value : '__custom__'

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-ink-500">Manzil</label>
      <select
        value={mode}
        onChange={(e) => {
          if (e.target.value === '__custom__') {
            onChange(isPreset ? '' : value)
          } else {
            onChange(e.target.value)
          }
        }}
        className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400"
      >
        {ADDRESS_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {preset}
          </option>
        ))}
        <option value="__custom__">Boshqa (yozish)…</option>
      </select>
      {!isPreset ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder="Manzilni yozing…"
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400"
        />
      ) : null}
    </div>
  )
}
