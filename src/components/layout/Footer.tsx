export function Footer() {
  return (
    <footer className="border-t border-border-DEFAULT bg-bg-primary px-6 py-8 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-text-secondary">&copy; {new Date().getFullYear()} Casuya Technologies</p>
        <div className="flex gap-4">
          <a href="/docs" className="text-[12px] text-text-secondary hover:text-text-primary">Documentation</a>
          <a href="/developer/docs" className="text-[12px] text-text-secondary hover:text-text-primary">API</a>
          <a href="/contact" className="text-[12px] text-text-secondary hover:text-text-primary">Contact</a>
        </div>
      </div>
    </footer>
  )
}
