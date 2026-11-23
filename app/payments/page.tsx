'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const planId = searchParams.get('plan_id')
  const billing = searchParams.get('billing')

  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return

    const startCheckout = async () => {
      if (!planId || !['monthly', 'yearly'].includes(billing || '')) {
        setError('Invalid plan or billing period. Please select a plan again.')
        return
      }

      started.current = true
      setError('')

      try {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            plan_id: planId,
            billing,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to start checkout.')
        }

        if (!data.url) {
          throw new Error('Stripe Checkout URL was not returned.')
        }

        window.location.href = data.url
      } catch (err) {
        started.current = false
        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        )
      }
    }

    startCheckout()
  }, [planId, billing, retry])

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">
              !
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to start payment
            </h1>

            <p className="text-gray-600 mb-6">{error}</p>

            <button
              onClick={() => {
                started.current = false
                setRetry((value) => value + 1)
              }}
              className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Try again
            </button>

            <button
              onClick={() => router.push('/pricing')}
              className="mt-3 w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to pricing
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Preparing your checkout
            </h1>

            <p className="text-gray-600">
              Please wait while we securely redirect you to Stripe.
            </p>
          </>
        )}
      </div>
    </main>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading checkout...</p>
        </main>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}