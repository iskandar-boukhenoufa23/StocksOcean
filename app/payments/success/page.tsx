'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Payment successful!
        </h1>

        <p className="mb-6 text-gray-600">
          Thank you for your purchase. Your payment was completed successfully.
          Your subscription will be activated after our payment confirmation
          webhook processes the transaction.
        </p>

        {sessionId && (
          <p className="mb-6 break-all text-xs text-gray-400">
            Payment reference: {sessionId}
          </p>
        )}

        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
        >
          Go to dashboard
        </Link>

        <Link
          href="/"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-800"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}