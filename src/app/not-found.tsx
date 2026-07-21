export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary px-4">
      <p className="text-[clamp(48px,10vw,72px)] font-bold text-accent-blue mb-4">404</p>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">Page Not Found</h1>
      <p className="text-[14px] text-text-secondary mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="text-[14px] text-accent-blue underline">Go Home</a>
    </div>
  )
}
