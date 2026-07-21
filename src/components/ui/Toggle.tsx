interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 border transition-all duration-120 ease-out cursor-pointer
          ${checked ? 'bg-accent-blue border-accent-blue' : 'bg-bg-secondary border-border-strong'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white transition-all duration-120 ease-out
          ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </div>
      {label && <span className="text-[14px] text-text-primary">{label}</span>}
    </label>
  )
}
