interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 flex items-center border transition-colors duration-120 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus
          ${checked ? 'bg-accent-blue border-accent-blue' : 'bg-bg-secondary border-border-strong'}`}
      >
        <span className={`absolute w-4 h-4 bg-white transition-all duration-120 ease-out
          ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {label && <span className="text-[14px] text-text-primary">{label}</span>}
    </span>
  )
}
