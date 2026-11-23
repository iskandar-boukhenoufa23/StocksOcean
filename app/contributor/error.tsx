'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ContributorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Contributor area error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-3 text-2xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-secondary">
          We could not load the contributor area. Please try again.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-header px-5 py-2 text-white"
          >
            Try again
          </button>
          <Link href="/" className="rounded-lg border px-5 py-2">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
