'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-[clamp(48px,10vw,72px)] font-bold text-accent-blue">500</h1>
        <h2 className="text-[16px] font-bold text-text-primary mt-2">Something went wrong</h2>
        <p className="text-[14px] text-text-secondary mt-2 mb-8">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="h-[44px] px-6 bg-accent-blue text-white text-[14px] font-bold uppercase tracking-[0.5px] hover:brightness-110 active:brightness-90"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
