interface LanguageToggleProps {
  lang: 'en' | 'sw'
  onToggle: () => void
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center h-8 border-2 border-border-strong text-[12px] font-bold uppercase tracking-[0.5px]"
    >
      <span className={`px-2 py-1 transition-all duration-120 ${lang === 'en' ? 'bg-accent-blue text-white' : 'text-text-secondary'}`}>EN</span>
      <span className={`px-2 py-1 transition-all duration-120 ${lang === 'sw' ? 'bg-accent-blue text-white' : 'text-text-secondary'}`}>SW</span>
    </button>
  )
}
