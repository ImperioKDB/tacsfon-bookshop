'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi, paymentApi } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatPrice(val) {
  return '₦' + Number(val ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Confirm Payment Modal ─────────────────────────────────────────────────────

function ConfirmModal({ intent, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await paymentApi.confirm(intent.ref_id)
      toast.success(`Payment confirmed! Order created for ${intent.profiles?.full_name ?? 'customer'}.`)
      onSuccess()
      onClose()
    } catch (err) {
      if (err.code === 'REF_ID_ALREADY_USED') toast.error('This payment was already confirmed.')
      else if (err.code === 'STOCK_CHANGED')  toast.error('Stock changed — check inventory before confirming.')
      else if (err.status === 403)            toast.error("You don't have permission to do that.")
      else                                    toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Confirm Payment" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Confirm that you have received the transfer for reference{' '}
          <span className="font-semibold text-text-primary font-mono">{intent.ref_id}</span>?
          This will create the order and notify the customer.
        </p>

        <div className="bg-primary-muted rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Customer</span>
            <span className="font-medium text-text-primary">{intent.profiles?.full_name ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Email</span>
            <span className="font-medium text-text-primary">{intent.profiles?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Phone</span>
            <span className="font-medium text-text-primary">{intent.profiles?.phone ?? '—'}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="text-text-secondary">Amount</span>
            <span className="font-bold text-primary text-base">{formatPrice(intent.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Initiated</span>
            <span className="font-medium text-text-primary">{formatDate(intent.created_at)}</span>
          </div>
        </div>

        <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
          ⚠️ Only confirm after verifying the transfer in your bank app. This action cannot be undone.
        </p>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary flex-1" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Confirming…</> : '✅ Confirm Payment'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === 'admin_confirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Processing
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
      Awaiting Confirmation
    </span>
  )
}

// ── Payment Row ───────────────────────────────────────────────────────────────

function PaymentRow({ intent, onConfirm }) {
  return (
    <tr className="border-b border-border hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-xs font-mono text-text-secondary whitespace-nowrap">
        {intent.ref_id}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-text-primary">{intent.profiles?.full_name ?? '—'}</p>
        <p className="text-xs text-text-secondary">{intent.profiles?.email ?? ''}</p>
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
        {intent.profiles?.phone ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm font-bold text-primary whitespace-nowrap">
        {formatPrice(intent.total_amount)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={intent.status} />
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
        <span title={formatDate(intent.created_at)}>{timeAgo(intent.created_at)}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => onConfirm(intent)}
          disabled={intent.status === 'admin_confirmed'}
          className="btn-primary text-xs px-4 py-2 min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {intent.status === 'admin_confirmed' ? 'Processing…' : '✅ Confirm'}
        </button>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const [intents, setIntents]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)

  const fetchIntents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await adminApi.getPendingPayments()
      setIntents(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.status === 401) toast.error('Session expired. Please log in again.')
      else toast.error('Could not load pending payments.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Auto-refresh every 30 seconds so admin sees new payments without manual refresh
  useEffect(() => {
    fetchIntents()
    const interval = setInterval(() => fetchIntents(true), 30_000)
    return () => clearInterval(interval)
  }, [fetchIntents])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Pending Payments</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading
              ? '…'
              : `${intents.length} transfer${intents.length !== 1 ? 's' : ''} awaiting confirmation · auto-refreshes every 30s`
            }
          </p>
        </div>
        <button
          onClick={() => fetchIntents(true)}
          disabled={refreshing}
          className="btn-secondary text-sm px-4 py-2 min-h-[40px] gap-1.5 self-start sm:self-auto"
        >
          {refreshing ? <Spinner size="sm" /> : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          )}
          Refresh
        </button>
      </div>

      {/* How-it-works banner */}
      <div className="bg-primary-muted border border-primary/20 rounded-2xl px-4 py-3 mb-6 text-sm text-text-secondary">
        <p>
          <span className="font-semibold text-text-primary">How this works: </span>
          When a customer checks out, they transfer to your bank account using their{' '}
          <span className="font-medium text-text-primary">Ref ID</span> as narration.
          They also send a WhatsApp message. Check your bank app, find the matching transfer,
          then click <span className="font-semibold text-primary">Confirm</span> to create the order.
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : intents.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No pending payments"
          description="New transfers from customers will appear here automatically."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Ref ID', 'Customer', 'Phone', 'Amount', 'Status', 'Time', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {intents.map(intent => (
                  <PaymentRow key={intent.id} intent={intent} onConfirm={setConfirmTarget} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmTarget && (
        <ConfirmModal
          intent={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onSuccess={() => fetchIntents(true)}
        />
      )}
    </div>
  )
}

