'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatPrice(val) {
  return '₦' + Number(val ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-primary font-medium
                 hover:underline underline-offset-4 transition-all"
    >
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Copied!</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy Link</>
      )}
    </button>
  )
}

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReceipts = useCallback(async () => {
    setLoading(true)
    try {
      // Admin receipts endpoint — adjust path if backend differs
      const data = await adminApi.getLogs({ type: 'receipts' }).catch(() => null)
      // Fall back to a receipts-specific endpoint if available
      // For now, use orders with payment_status = paid as proxy
      const ordersData = await adminApi.getOrders('all')
      const allOrders = ordersData.orders ?? ordersData ?? []
      setReceipts(allOrders.filter(o => o.payment_status === 'paid' || o.share_token))
    } catch {
      toast.error('Could not load receipts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReceipts() }, [fetchReceipts])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Receipts</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {loading ? '…' : `${receipts.length} receipt${receipts.length !== 1 ? 's' : ''} issued`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : receipts.length === 0 ? (
        <EmptyState icon="🧾" title="No receipts yet" description="Receipts are generated for paid orders." />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Total', 'Ref ID', 'Date', 'Share Link'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">#{r.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.customer_name ?? r.profiles?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{formatPrice(r.total)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">{r.ref_id ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      {r.share_token ? (
                        <CopyButton text={`${appUrl}/receipt/${r.share_token}`} />
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

