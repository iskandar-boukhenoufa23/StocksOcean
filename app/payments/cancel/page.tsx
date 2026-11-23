'use client'

import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Payment cancelled
        </h1>

        <p className="mb-8 text-gray-600">
          Your payment was not completed. You have not been charged for this
          checkout. You can return to the pricing page and try again whenever
          you are ready.
        </p>

        <Link
          href="/pricing"
          className="block w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
        >
          Return to pricing
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