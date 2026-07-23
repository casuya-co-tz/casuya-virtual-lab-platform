interface LanguageToggleProps {
  lang: 'en' | 'sw'
  onToggle: () => void
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center h-9 bg-bg-secondary border border-border-default rounded-xl overflow-hidden text-[12px] font-bold uppercase tracking-[0.5px] transition-shadow hover:shadow-sm"
    >
      <span className={`flex items-center justify-center w-8 h-full transition-all duration-300 ${lang === 'en' ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white' : 'text-text-secondary hover:text-text-primary'}`}>EN</span>
      <span className={`flex items-center justify-center w-8 h-full transition-all duration-300 ${lang === 'sw' ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white' : 'text-text-secondary hover:text-text-primary'}`}>SW</span>
    </button>
  )
}
