'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ordersApi } from '@/lib/api'
import OrderStatusBadge, { getStatusStep } from '@/components/orders/OrderStatusBadge'
import { ConfirmModal } from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { toastSuccess, toastError, toastPromise } from '@/components/ui/Toast'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-5" aria-hidden="true">
      <Skeleton className="h-4 w-32 mb-2" />
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-5 w-1/3 ml-auto" />
      </div>
    </div>
  )
}

// ── Status timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: '🛍️', desc: 'We\'ve received your order'   },
  { key: 'dispatched', label: 'Dispatched',      icon: '🚚', desc: 'Your order is on the way'      },
  { key: 'received',   label: 'Received',        icon: '✅', desc: 'You\'ve confirmed receipt'     },
]

function StatusTimeline({ status }) {
  const { step, cancelled } = getStatusStep(status)

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-accent text-sm">Order Cancelled</p>
          <p className="text-xs text-text-secondary mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((s, i) => {
        const done   = i < step
        const active = i === step
        const future = i > step

        return (
          <div key={s.key} className="flex gap-4">
            {/* Line + dot column */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0
                border-2 transition-all duration-300
                ${done   ? 'bg-primary border-primary'           : ''}
                ${active ? 'bg-white border-primary shadow-sm'   : ''}
                ${future ? 'bg-gray-50 border-border'            : ''}
              `}>
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                ) : (
                  <span className={active ? 'text-primary' : 'text-text-secondary/40'}>
                    {s.icon}
                  </span>
                )}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-[28px] mt-1 transition-colors duration-300
                  ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>

            {/* Text */}
            <div className={`pb-6 ${i === TIMELINE_STEPS.length - 1 ? 'pb-0' : ''}`}>
              <p className={`text-sm font-semibold leading-tight
                ${active ? 'text-primary' : done ? 'text-text-primary' : 'text-text-secondary/50'}`}>
                {s.label}
              </p>
              <p className={`text-xs mt-0.5 leading-snug
                ${active || done ? 'text-text-secondary' : 'text-text-secondary/40'}`}>
                {s.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Order item row ────────────────────────────────────────────────────────────

function OrderItemRow({ item }) {
  const product = item.product ?? {}
  const lineTotal = (item.unit_price ?? product.price ?? 0) * item.quantity

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name ?? 'Product'}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary leading-snug truncate">
          {product.name ?? item.product_name ?? 'Product'}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">
          {formatPrice(item.unit_price ?? product.price ?? 0)} × {item.quantity}
        </p>
      </div>

      {/* Line total */}
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
  const { id } = useParams()
  const router = useRouter()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [marking, setMarking] = useState(false)

  const fetchOrder = useCallback(() => {
    return ordersApi.getById(id)
      .then(data => setOrder(data?.order ?? data))
      .catch(() => {
        toastError('Order not found.')
        router.push('/orders')
      })
  }, [id, router])

  useEffect(() => {
    setLoading(true)
    fetchOrder().finally(() => setLoading(false))
  }, [fetchOrder])

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
      // Re-fetch to get updated status + any receipt that was generated
      await fetchOrder()
      setConfirmOpen(false)
    } catch {
      // toastPromise already shows the error
    } finally {
      setMarking(false)
    }
  }

  if (loading) return <OrderDetailSkeleton />
  if (!order)  return null

  const items        = order.order_items ?? order.items ?? []
  const total        = order.total_amount ?? order.total ?? 0
  const shareToken   = order.receipt?.share_token ?? order.share_token

  const canMarkReceived = order.status === 'dispatched'

  return (
    <div className="page-enter min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/orders" className="hover:text-primary transition-colors">
            My Orders
          </Link>
          <span>›</span>
          <span className="text-text-primary font-medium">
            #{order.ref_id ?? id?.slice(0, 8).toUpperCase()}
          </span>
        </nav>

        {/* ── Section 1: Header card ─────────────────────────────────────── */}
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

          {/* Status timeline */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
              Delivery Progress
            </p>
            <StatusTimeline status={order.status} />
          </div>

          {/* CTA — mark received */}
          {canMarkReceived && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <p className="text-sm text-text-secondary mb-3">
                Have you received this order? Confirm below to close it out.
              </p>
              <button
                onClick={() => setConfirmOpen(true)}
                className="btn-primary w-full"
              >
                ✅ Mark as Received
              </button>
            </div>
          )}

          {/* Share receipt link — shown after received */}
          {order.status === 'received' && shareToken && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <Link
                href={`/receipts/${shareToken}`}
                className="btn-secondary w-full text-sm"
              >
                🧾 View Receipt
              </Link>
            </div>
          )}
        </div>

        {/* ── Section 2: Items ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">
            Items
          </p>
          <p className="text-sm text-text-secondary mb-4">
            {items.length} {items.length === 1 ? 'item' : 'items'} ordered
          </p>

          {items.length > 0 ? (
            <div>
              {items.map((item, i) => (
                <OrderItemRow key={item.id ?? i} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary italic">No item details available.</p>
          )}
        </div>

        {/* ── Section 3: Order summary ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
            Order Summary
          </p>

          <InfoRow label="Subtotal"       value={formatPrice(total)} />
          <InfoRow label="Delivery"       value="Included" />
          <InfoRow label="Payment Status" value={
            order.payment_status === 'paid'       ? '✓ Paid'      :
            order.payment_status === 'incomplete' ? '⚠ Partial'   : '○ Unpaid'
          } className={
            order.payment_status === 'paid'       ? 'text-green-700 font-semibold' :
            order.payment_status === 'incomplete' ? 'text-orange-600'              : ''
          } />
          <InfoRow label="Order Type" value={
            order.order_type === 'walkin' ? '🏪 Walk-in' : '🌐 Online'
          } />

          {/* Total — always show */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-primary text-lg">{formatPrice(total)}</span>
          </div>
        </div>

        {/* ── Section 4: Delivery info ───────────────────────────────────── */}
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

        {/* ── Payment ref ─────────────────────────────────────────────────── */}
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

        {/* ── Bottom nav ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link href="/orders" className="btn-secondary flex-1 text-sm">
            ← Back to Orders
          </Link>
          <Link href="/products" className="btn-primary flex-1 text-sm">
            Continue Shopping
          </Link>
        </div>

      </div>

      {/* ── Confirm modal ─────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleMarkReceived}
        loading={marking}
        title="Confirm receipt?"
        message="Please only confirm if you have actually received all the items in this order. This action cannot be undone."
        confirmLabel="Yes, I received it"
        cancelLabel="Not yet"
      />
    </div>
  )
}

