'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ordersApi } from '@/lib/api'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import OrderTimeline from '@/components/orders/OrderTimeline'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import { toastError, toastPromise } from '@/components/ui/Toast'

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-4 animate-pulse">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="bg-white rounded-2xl border border-border/60 p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="skeleton h-5 w-40 rounded" />
            <div className="skeleton h-3 w-28 rounded" />
          </div>
          <div className="skeleton h-7 w-24 rounded-full" />
        </div>
        <div className="skeleton h-24 w-full rounded-xl mt-4" />
      </div>
      <div className="bg-white rounded-2xl border border-border/60 p-5 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-3">
            <div className="skeleton h-14 w-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Order item row ─────────────────────────────────────────────────────────────

function OrderItemRow({ item }) {
  const product  = item.product ?? {}
  const lineTotal = (item.unit_price ?? product.price ?? 0) * item.quantity

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name ?? 'Product'}
            fill className="object-cover" sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary leading-snug truncate">
          {product.name ?? item.product_name ?? 'Product'}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">
          {formatPrice(item.unit_price ?? product.price ?? 0)} × {item.quantity}
        </p>
      </div>
      <p className="text-sm font-semibold text-text-primary shrink-0">
        {formatPrice(lineTotal)}
      </p>
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, className = '' }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-text-secondary shrink-0">{label}</span>
      <span className={`text-sm text-text-primary text-right leading-snug ${className}`}>{value}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [order,       setOrder]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [marking,     setMarking]     = useState(false)

  const fetchOrder = useCallback(() => {
    return ordersApi.getById(id)
      .then(data => setOrder(data?.order ?? data))
      .catch(() => {
        toastError('Order not found.')
        router.push('/orders')
      })
  }, [id, router])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/orders/' + id)
      return
    }
    setLoading(true)
    fetchOrder().finally(() => setLoading(false))
  }, [user, authLoading, fetchOrder, id])

  async function handleMarkReceived() {
    setMarking(true)
    try {
      await toastPromise(
        ordersApi.markReceived(id),
        {
          loading: 'Marking as received...',
          success: 'Order marked as received! 🎉',
          error:   'Could not update order. Please try again.',
        }
      )
      await fetchOrder()
      setConfirmOpen(false)
    } catch {
      // toastPromise already shows the error
    } finally {
      setMarking(false)
    }
  }

  if (loading || authLoading) return <OrderDetailSkeleton />
  if (!order) return null

  const items      = order.order_items ?? order.items ?? []
  const total      = order.total_amount ?? order.total ?? 0
  const shareToken = order.receipt?.share_token ?? order.share_token
  const canMarkReceived = order.status === 'dispatched'

  return (
    <div className="page-enter min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/orders" className="hover:text-primary transition-colors">My Orders</Link>
          <span>›</span>
          <span className="text-text-primary font-medium">
            #{order.ref_id ?? id?.slice(0, 8).toUpperCase()}
          </span>
        </nav>

        {/* ── Header card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">

          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-lg font-bold text-text-primary leading-tight">
                Order #{order.ref_id ?? id?.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">{formatDate(order.created_at)}</p>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>

          {/* Progress timeline */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
              Delivery Progress
            </p>
            <OrderTimeline status={order.status} />
          </div>

          {/* Mark received CTA */}
          {canMarkReceived && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <p className="text-sm text-text-secondary mb-3">
                Have you received this order? Confirm below to close it out.
              </p>
              <button onClick={() => setConfirmOpen(true)} className="btn-primary w-full">
                ✅ Mark as Received
              </button>
            </div>
          )}

          {/* View receipt link */}
          {order.status === 'received' && shareToken && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <Link href={`/receipt/${shareToken}`} className="btn-secondary w-full text-sm">
                🧾 View Receipt
              </Link>
            </div>
          )}
        </div>

        {/* ── Items ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Items</p>
          <p className="text-sm text-text-secondary mb-4">
            {items.length} {items.length === 1 ? 'item' : 'items'} ordered
          </p>
          {items.length > 0 ? (
            items.map((item, i) => <OrderItemRow key={item.id ?? i} item={item} />)
          ) : (
            <p className="text-sm text-text-secondary italic">No item details available.</p>
          )}
        </div>

        {/* ── Order summary ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
            Order Summary
          </p>
          <InfoRow label="Subtotal"       value={formatPrice(total)} />
          <InfoRow label="Delivery"       value="Included" />
          <InfoRow
            label="Payment Status"
            value={
              order.payment_status === 'paid'       ? '✓ Paid'     :
              order.payment_status === 'incomplete' ? '⚠ Partial'  : '○ Unpaid'
            }
            className={
              order.payment_status === 'paid'       ? 'text-green-700 font-semibold' :
              order.payment_status === 'incomplete' ? 'text-orange-600'              : ''
            }
          />
          <InfoRow
            label="Order Type"
            value={order.order_type === 'walkin' ? '🏪 Walk-in' : '🌐 Online'}
          />
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-primary text-lg">{formatPrice(total)}</span>
          </div>
        </div>

        {/* ── Delivery info ─────────────────────────────────────────────────── */}
        {(order.delivery_address || order.phone || order.notes) && (
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
              Delivery Details
            </p>
            <InfoRow label="Address" value={order.delivery_address} />
            <InfoRow label="Phone"   value={order.phone} />
            <InfoRow label="Notes"   value={order.notes} />
          </div>
        )}

        {/* ── Payment reference ─────────────────────────────────────────────── */}
        {order.ref_id && (
          <div className="bg-primary-muted rounded-2xl border border-primary/10 p-5 mb-4">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
              Payment Reference
            </p>
            <p className="font-mono text-text-primary font-bold text-sm tracking-widest">
              {order.ref_id}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Use this reference when making your bank transfer.
            </p>
          </div>
        )}

        {/* ── Bottom nav ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link href="/orders"   className="btn-secondary flex-1 text-sm">← Back to Orders</Link>
          <Link href="/products" className="btn-primary flex-1 text-sm">Continue Shopping</Link>
        </div>

      </div>

      {/* ── Confirm received modal ────────────────────────────────────────── */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => !marking && setConfirmOpen(false)}
        title="Confirm receipt?"
      >
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          Please only confirm if you have actually received all the items in this order.
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            disabled={marking}
            className="btn-secondary flex-1 text-sm"
          >
            Not yet
          </button>
          <button
            onClick={handleMarkReceived}
            disabled={marking}
            className="btn-primary flex-1 text-sm"
          >
            {marking ? <Spinner size="sm" className="text-white" /> : 'Yes, I received it'}
          </button>
        </div>
      </Modal>

    </div>
  )
}

