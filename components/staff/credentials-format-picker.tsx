'use client'

export type CredentialsDeliveryFormat = 'xlsx' | 'pdf' | 'screen'

const options: { value: CredentialsDeliveryFormat; label: string; hint: string }[] = [
  { value: 'xlsx', label: 'Excel', hint: 'Download an .xlsx file with the credentials.' },
  { value: 'pdf', label: 'PDF', hint: 'Download a .pdf file with the credentials.' },
  { value: 'screen', label: 'Just show me the password', hint: 'Display it once on screen, no file.' },
]

export function CredentialsFormatPicker({
  name,
  value,
  onChange,
}: {
  name: string
  value: CredentialsDeliveryFormat
  onChange: (value: CredentialsDeliveryFormat) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">How should the credentials be delivered?</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${value === option.value ? 'border-primary ring-2 ring-primary/20' : ''}`}
        >
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="block font-medium">{option.label}</span>
            <span className="block text-xs text-muted-foreground">{option.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
