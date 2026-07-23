import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function StudentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-[20px] font-bold text-text-primary mb-2">Page not found</h2>
      <p className="text-[14px] text-text-secondary mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/student">
        <Button variant="primary">Back to Dashboard</Button>
      </Link>
    </div>
  )
}
