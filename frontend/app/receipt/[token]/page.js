// app/receipt/[token]/page.js
// Public route — no authentication required.
// Middleware does NOT protect this path (only covers /cart, /checkout, /orders, /profile, /admin).

'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReceiptView from '@/components/receipts/ReceiptView'
import ReceiptDownload from '@/components/receipts/ReceiptDownload'
import { receiptsApi } from '@/lib/api'

// ── Skeleton ─────────────────────────────────────────────────────────────────
function ReceiptSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-24 bg-gray-200 rounded-2xl" />
      <div className="h-16 bg-gray-100 rounded-2xl" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-48 bg-gray-100 rounded-2xl" />
    </div>
  )
}

// ── Empty / not-found state ───────────────────────────────────────────────────
function ReceiptNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">Receipt not found</h2>
      <p className="text-sm text-gray-500 max-w-xs">
        This receipt link may have expired or is invalid. Contact the bookshop if you believe this is a mistake.
      </p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PublicReceiptPage() {
  const { token } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return

    async function fetchReceipt() {
      try {
        // TODO: backend endpoint needed — GET /api/receipts/:token (public, no auth)
        const data = await receiptsApi.getByToken(token)
        setReceipt(data)
      } catch (err) {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [token])

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 px-4">
      {/* Minimal public header */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2">
        <div className="w-7 h-7 bg-[#1a5c38] rounded-full flex items-center justify-center">
          <span className="text-white font-black text-xs">T</span>
        </div>
        <span className="text-sm font-semibold text-gray-700">TACSFON Bookshop</span>
      </div>

      {loading && <ReceiptSkeleton />}

      {!loading && notFound && <ReceiptNotFound />}

      {!loading && receipt && (
        <div className="max-w-2xl mx-auto space-y-5">
          <ReceiptView receipt={receipt} />

          {/* Download / share — available on the public page too */}
          <div className="flex justify-center pb-4">
            <ReceiptDownload
              refId={receipt.ref_id}
              shareToken={token} // share token is the current URL token
            />
          </div>
        </div>
      )}
    </div>
  )
}

