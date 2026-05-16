'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ordersApi } from '@/lib/api'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import OrderTimeline from '@/components/orders/OrderTimeline'
import Spinner from '@/components/ui/spinner'
import toast from 'react-hot-toast'

function formatPrice(amount) {
  return '₦' + Number(amount ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary shrink-0">{label}</span>
      <span className="text-sm font-medium text-text-primary text-right">{value ?? '—'}</span>
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="skeleton h-52 w-full rounded-2xl" />
      <div className="skeleton h-36 w-full rounded-2xl" />
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order,    setOrder]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [marking,  setMarking]  = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const data = await ordersApi.getById(id)
      setOrder(data?.order ?? data)
    } catch (err) {
      if (err?.status === 404) {
        toast.error('Order not found.')
        router.replace('/orders')
      } else if (err?.status === 401) {
        router.replace('/login?redirect=/orders')
      } else {
        toast.error('Could not load order. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login?redirect=/orders'); return }
    fetchOrder()
  }, [user, authLoading, fetchOrder, router])

  async function handleMarkReceived() {
    setMarking(true)
    try {
      await ordersApi.markReceived(id)
      toast.success('Order marked as received!')
      fetchOrder()
    } catch {
      toast.error('Could not update order. Please try again.')
    } finally {
      setMarking(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 page-enter">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
          <OrderSkeleton />
        </div>
      </div>
    )
  }

  if (!order) return null

  const items = order.order_items ?? order.items ?? []

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        {/* Back */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary
                     hover:text-primary transition-colors mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Order #{order.id?.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Placed {formatDate(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.order_status ?? order.status} size="lg" />
        </div>

        <div className="space-y-4">

          {/* Timeline */}
          {(order.order_status ?? order.status) !== 'cancelled' && (
            <OrderTimeline status={order.order_status ?? order.status} />
          )}

          {/* Order details */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
            <h2 className="font-semibold text-text-primary mb-2 text-sm">Delivery Details</h2>
            <div>
              <DetailRow label="Name"    value={order.customer_name} />
              <DetailRow label="Phone"   value={order.phone} />
              <DetailRow label="Address" value={order.delivery_address} />
              {order.ref_id && <DetailRow label="Ref ID" value={order.ref_id} />}
            </div>
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
              <h2 className="font-semibold text-text-primary mb-3 text-sm">
                Items ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((item, i) => {
                  const product = item.product ?? item.products ?? {}
                  const name    = product.name ?? item.product_name ?? 'Item'
                  const price   = item.unit_price ?? product.price ?? 0
                  return (
                    <div key={item.id ?? i}
                         className="flex items-center justify-between gap-3 py-2.5
                                    border-b border-border last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary line-clamp-1">{name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatPrice(price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-text-primary shrink-0">
                        {formatPrice(Number(price) * Number(item.quantity))}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="font-bold text-text-primary text-sm">Total</span>
                <span className="font-extrabold text-primary text-base">
                  {formatPrice(order.total_amount ?? order.total)}
                </span>
              </div>
            </div>
          )}

          {/* Mark received CTA */}
          {(order.order_status ?? order.status) === 'dispatched' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-sm text-amber-800 font-medium mb-3">
                📦 Your order has been dispatched. Have you received it?
              </p>
              <button
                onClick={handleMarkReceived}
                disabled={marking}
                className="btn-primary w-full text-sm justify-center"
              >
                {marking ? (
                  <><Spinner size="sm" color="white" /> Updating…</>
                ) : (
                  '✅ Mark as Received'
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
