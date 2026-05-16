'use client'
import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { paymentApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'

function formatPrice(val) {
  return '₦' + Number(val ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ConfirmModal({ intent, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await paymentApi.confirm(intent.ref_id)
      toast.success('Payment confirmed. Order created!')
      onSuccess()
      onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission to do that.")
      else if (err?.status === 404) toast.error('Payment intent not found.')
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Confirm Payment" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-primary-muted rounded-xl p-3 text-sm space-y-1.5">
          <p><span className="text-text-secondary">Customer:</span>{' '}
            <span className="font-medium">{intent.customer_name}</span></p>
          <p><span className="text-text-secondary">Phone:</span>{' '}
            <span className="font-medium">{intent.phone}</span></p>
          <p><span className="text-text-secondary">Amount:</span>{' '}
            <span className="font-semibold text-primary">{formatPrice(intent.total_amount)}</span></p>
          <p><span className="text-text-secondary">Ref:</span>{' '}
            <span className="font-mono font-medium tracking-wide">{intent.ref_id}</span></p>
          <p><span className="text-text-secondary">Address:</span>{' '}
            <span className="font-medium">{intent.delivery_address}</span></p>
        </div>
        <p className="text-sm text-text-secondary">
          Confirming will create the order, deduct stock, and send a notification to the customer.
        </p>
        <div className="flex gap-3">
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

export default function AdminPaymentsPage() {
  const [intents,  setIntents]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [target,   setTarget]   = useState(null)

  const fetchIntents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getPendingPayments()
      setIntents(Array.isArray(data) ? data : (data.intents ?? data.payment_intents ?? []))
    } catch {
      toast.error('Could not load pending payments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchIntents() }, [fetchIntents])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Pending Payments</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${intents.length} transfer${intents.length !== 1 ? 's' : ''} awaiting confirmation`}
          </p>
        </div>
        <button
          onClick={() => fetchIntents()}
          className="btn-secondary text-sm px-4 py-2 min-h-[40px] gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : intents.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No pending payments"
          description="All bank transfers have been confirmed."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Ref ID', 'Customer', 'Phone', 'Amount', 'Address', 'Date', 'Action'].map(h => (
                    <th key={h}
                        className="px-4 py-3 text-xs font-semibold text-text-secondary
                                   uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {intents.map(intent => (
                  <tr key={intent.id}
                      className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-primary tracking-wide">
                      {intent.ref_id}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary whitespace-nowrap">
                      {intent.customer_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {intent.phone}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
                      {formatPrice(intent.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary max-w-[160px] truncate">
                      {intent.delivery_address}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                      {formatDate(intent.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setTarget(intent)}
                        className="btn-primary text-xs px-4 py-2 min-h-[36px]"
                      >
                        ✅ Confirm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {target && (
        <ConfirmModal
          intent={target}
          onClose={() => setTarget(null)}
          onSuccess={fetchIntents}
        />
      )}
    </div>
  )
}
