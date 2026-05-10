'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { paymentApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'

const MAX_ATTEMPTS   = 12
const POLL_INTERVAL  = 5000  // 5 seconds

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

// ── Main verify logic ─────────────────────────────────────────────────────────

function VerifyContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const ref          = searchParams.get('ref')

  // 'polling' | 'success' | 'incomplete' | 'timeout'
  const [status,         setStatus]         = useState('polling')
  const [attempts,       setAttempts]       = useState(0)
  const [paidAmount,     setPaidAmount]     = useState(null)
  const [expectedAmount, setExpectedAmount] = useState(null)

  const attemptsRef = useRef(0)
  const timerRef    = useRef(null)

  useEffect(() => {
    // No ref in URL — send them to orders
    if (!ref) {
      router.replace('/orders')
      return
    }

    async function poll() {
      attemptsRef.current += 1
      setAttempts(attemptsRef.current)

      try {
        const data = await paymentApi.verify(ref)

        if (data?.order_id) {
          // ✅ Payment confirmed
          clearTimeout(timerRef.current)
          setStatus('success')
          // Small delay so user sees the success screen before redirect
          setTimeout(() => router.replace(`/orders/${data.order_id}`), 1800)
          return
        }

        // Backend returned { status: 'pending' } — keep polling
        scheduleNext()

      } catch (err) {
        if (err.status === 402) {
          // ❌ Incomplete payment — stop polling, show amounts
          clearTimeout(timerRef.current)
          setPaidAmount(err.paid_amount ?? null)
          setExpectedAmount(err.expected_amount ?? null)
          setStatus('incomplete')
          return
        }

        // Any other error — keep trying until max attempts
        scheduleNext()
      }
    }

    function scheduleNext() {
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setStatus('timeout')
        return
      }
      timerRef.current = setTimeout(poll, POLL_INTERVAL)
    }

    // Small initial delay before first check
    timerRef.current = setTimeout(poll, 1200)

    return () => clearTimeout(timerRef.current)
  }, [ref, router])

  if (!ref) return null

  // ── Polling ───────────────────────────────────────────────────────────────
  if (status === 'polling') {
    return (
      <div className="min-h-[72vh] flex flex-col items-center justify-center px-4 text-center">

        {/* Spinner circle */}
        <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-primary/10
                        flex items-center justify-center mb-6">
          <Spinner size="lg" />
        </div>

        <h1 className="text-xl font-bold text-text-primary mb-2">
          Verifying your payment…
        </h1>
        <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
          This usually takes a few seconds. Please don't close this page.
        </p>

        {/* Ref display */}
        <p className="text-xs text-text-secondary mt-4 font-mono
                      bg-gray-50 px-3 py-1.5 rounded-full border border-border/50">
          Ref: {ref}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-7">
          {[...Array(MAX_ATTEMPTS)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-5 rounded-full transition-all duration-500 ${
                i < attempts ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-2">
          Check {attempts} of {MAX_ATTEMPTS}
        </p>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-[72vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Payment Confirmed! 🎉</h1>
        <p className="text-sm text-text-secondary">Redirecting you to your order…</p>
        <Spinner size="sm" className="mt-5" />
      </div>
    )
  }

  // ── Incomplete payment ────────────────────────────────────────────────────
  if (status === 'incomplete') {
    return (
      <div className="min-h-[72vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">

            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <h2 className="text-lg font-bold text-red-800 mb-2">Incomplete Payment</h2>

            {paidAmount !== null && expectedAmount !== null && (
              <p className="text-sm text-red-700 mb-3 leading-relaxed">
                You paid <strong>{formatPrice(paidAmount)}</strong> but{' '}
                <strong>{formatPrice(expectedAmount)}</strong> was required.
              </p>
            )}

            <p className="text-sm text-red-700 mb-5 leading-relaxed">
              Please contact admin on WhatsApp for a refund or to resolve this.
            </p>

            <a
              href={`https://wa.me/2348087672926?text=Hi%2C+I+have+an+incomplete+payment.+My+reference+is+${ref}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold
                         rounded-full px-6 py-2.5 text-sm hover:bg-red-700 transition-colors mb-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact Admin on WhatsApp
            </a>

            <div>
              <Link href="/orders" className="text-sm text-red-600 hover:underline underline-offset-2">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Timeout ───────────────────────────────────────────────────────────────
  if (status === 'timeout') {
    return (
      <div className="min-h-[72vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">

          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="#d97706" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <h2 className="text-xl font-bold text-text-primary mb-3">Still waiting…</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto mb-6">
            We couldn't confirm your payment yet. If you've already transferred,
            your order will be processed shortly. Contact admin if this persists.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="btn-primary text-sm px-8">
              Check My Orders
            </Link>
            <a
              href={`https://wa.me/2348087672926?text=Hi%2C+I+paid+but+my+order+isn't+confirmed+yet.+My+reference+is+${ref}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-8"
            >
              Contact Admin
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ── Export ────────────────────────────────────────────────────────────────────
// useSearchParams requires Suspense boundary in Next.js App Router

export default function VerifyPage() {
  return (
    <div className="page-enter">
      <Suspense fallback={
        <div className="min-h-[72vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  )
}

