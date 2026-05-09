'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatPrice(val) {
  const n = Number(val ?? 0)
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Walk-in Order Modal ──────────────────────────────────────────────────────

function WalkinModal({ products, onClose, onSuccess }) {
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState([{ product_id: '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)

  function addRow() {
    setRows(r => [...r, { product_id: '', quantity: 1 }])
  }

  function updateRow(i, field, value) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  function removeRow(i) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (!customerName.trim()) return toast.error('Customer name is required.')
    if (!phone.trim()) return toast.error('Phone number is required.')
    const validRows = rows.filter(r => r.product_id && r.quantity >= 1)
    if (validRows.length === 0) return toast.error('Add at least one item.')

    setSubmitting(true)
    try {
      // Frontend never calculates totals — backend returns confirmed total
      const result = await adminApi.createWalkin({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        items: validRows.map(r => ({ product_id: r.product_id, quantity: Number(r.quantity) })),
      })
      toast.success(`Walk-in order created! Total: ${formatPrice(result.order?.total ?? result.total)}`)
      onSuccess()
      onClose()
    } catch (err) {
      if (err.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Record Walk-in Order" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Customer Name *</label>
            <input
              className="input-field"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone *</label>
            <input
              className="input-field"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="08012345678"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
          <textarea
            className="input-field min-h-[70px] resize-none"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional notes about this order"
          />
        </div>

        {/* Item rows */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Items *</label>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="input-field flex-1 min-h-[44px]"
                  value={row.product_id}
                  onChange={e => updateRow(i, 'product_id', e.target.value)}
                >
                  <option value="">Select product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  className="input-field w-20 text-center"
                  value={row.quantity}
                  onChange={e => updateRow(i, 'quantity', e.target.value)}
                />
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(i)}
                    className="p-2 text-text-secondary hover:text-accent transition-colors"
                    aria-label="Remove row"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mt-2 flex items-center gap-1.5 text-sm text-primary font-medium
                       hover:underline underline-offset-4 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Item
          </button>
        </div>

        <p className="text-xs text-text-secondary bg-primary-muted rounded-xl px-3 py-2">
          ℹ️ Total will be calculated by the server after submission.
        </p>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <><Spinner size="sm" /> Creating…</> : 'Create Order'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Dispatch Confirmation Modal ──────────────────────────────────────────────

function DispatchModal({ order, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleDispatch() {
    setLoading(true)
    try {
      await adminApi.dispatchOrder(order.id)
      toast.success('Order dispatched successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      if (err.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Dispatch Order" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Mark order <span className="font-semibold text-text-primary">#{order.id?.slice(0, 8)}</span> as dispatched?
          This will notify the customer.
        </p>
        <div className="bg-primary-muted rounded-xl p-3 text-sm space-y-1">
          <p><span className="text-text-secondary">Customer:</span> <span className="font-medium">{order.customer_name ?? order.profiles?.full_name ?? '—'}</span></p>
          <p><span className="text-text-secondary">Total:</span> <span className="font-medium text-primary">{formatPrice(order.total)}</span></p>
          <p><span className="text-text-secondary">Address:</span> <span className="font-medium">{order.delivery_address ?? '—'}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button onClick={handleDispatch} className="btn-primary flex-1" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Dispatching…</> : '🚚 Dispatch'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Order Table Row ──────────────────────────────────────────────────────────

function OrderRow({ order, onDispatch }) {
  const items = order.order_items ?? []
  const summary = items.length > 0
    ? items.slice(0, 2).map(i => `${i.product?.name ?? 'Item'} ×${i.quantity}`).join(', ')
      + (items.length > 2 ? ` +${items.length - 2} more` : '')
    : '—'

  return (
    <tr className="border-b border-border hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-xs font-mono text-text-secondary whitespace-nowrap">
        #{order.id?.slice(0, 8)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-text-primary whitespace-nowrap">
        {order.customer_name ?? order.profiles?.full_name ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary max-w-[180px] truncate">
        {summary}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
        {formatPrice(order.total)}
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
        {formatDate(order.created_at)}
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
        {order.profiles?.phone ?? order.phone ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary max-w-[140px] truncate">
        {order.delivery_address ?? '—'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => onDispatch(order)}
          className="btn-primary text-xs px-4 py-2 min-h-[36px]"
        >
          🚚 Dispatch
        </button>
      </td>
    </tr>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPendingOrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dispatchTarget, setDispatchTarget] = useState(null)
  const [showWalkin, setShowWalkin] = useState(false)

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await adminApi.getOrders('pending')
      setOrders(data.orders ?? data ?? [])
    } catch (err) {
      if (err.status === 401) toast.error('Session expired. Please log in again.')
      else toast.error('Could not load orders. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    // Also load products for walk-in modal
    adminApi.getProducts()
      .then(d => setProducts(d.products ?? d ?? []))
      .catch(() => {})
  }, [fetchOrders])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Pending Orders</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} awaiting dispatch`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="btn-secondary text-sm px-4 py-2 min-h-[40px] gap-1.5"
          >
            {refreshing ? <Spinner size="sm" /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            )}
            Refresh
          </button>
          <button
            onClick={() => setShowWalkin(true)}
            className="btn-primary text-sm px-4 py-2 min-h-[40px]"
          >
            + Walk-in Order
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No pending orders"
          description="All orders have been dispatched or there are no new orders yet."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Phone', 'Address', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} onDispatch={setDispatchTarget} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatch modal */}
      {dispatchTarget && (
        <DispatchModal
          order={dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          onSuccess={() => fetchOrders(true)}
        />
      )}

      {/* Walk-in modal */}
      {showWalkin && (
        <WalkinModal
          products={products}
          onClose={() => setShowWalkin(false)}
          onSuccess={() => fetchOrders(true)}
        />
      )}
    </div>
  )
}

