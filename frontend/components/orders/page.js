'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ordersApi } from '@/lib/api'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { toastError } from '@/components/ui/Toast'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5" aria-hidden="true">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  )
}

// ── Status filter tabs ────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: '',           label: 'All'        },
  { value: 'pending',    label: '🕐 Pending'    },
  { value: 'dispatched', label: '🚚 Dispatched' },
  { value: 'received',   label: '✅ Received'   },
  { value: 'cancelled',  label: '❌ Cancelled'  },
]

function StatusTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {STATUS_TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px] border
            ${active === tab.value
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Order card ────────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const itemCount = order.order_items?.length ?? order.item_count ?? 0
  const totalAmount = order.total_amount ?? order.total ?? 0

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-2xl border border-border/60 shadow-sm p-5
                 hover:border-primary/40 hover:shadow-md hover:translate-y-[-1px]
                 transition-all duration-200 group"
    >
      {/* Top row — ref + badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-semibold text-text-primary text-sm leading-tight">
            Order #{order.ref_id ?? order.id?.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Meta — items + payment */}
      <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
        <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        {itemCount > 0 && <span className="w-1 h-1 rounded-full bg-border" />}
        <span className={`font-medium ${
          order.payment_status === 'paid'
            ? 'text-green-700'
            : order.payment_status === 'incomplete'
            ? 'text-orange-600'
            : 'text-text-secondary'
        }`}>
          {order.payment_status === 'paid'
            ? '✓ Paid'
            : order.payment_status === 'incomplete'
            ? '⚠ Partial'
            : '○ Unpaid'}
        </span>
      </div>

      {/* Bottom row — total + arrow */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <p className="font-bold text-primary text-base">{formatPrice(totalAmount)}</p>
        <span className="text-xs font-medium text-primary flex items-center gap-1
                         group-hover:gap-2 transition-all duration-200">
          View details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    ordersApi.getAll()
      .then(data => {
        // Handle both { orders: [] } and plain []
        setOrders(data?.orders ?? data ?? [])
      })
      .catch(() => toastError('Could not load your orders. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders

  return (
    <div className="page-enter min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-border px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track all your purchases and delivery status
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">

        {/* Status tabs */}
        {!loading && orders.length > 0 && (
          <div className="mb-5">
            <StatusTabs active={statusFilter} onChange={setStatusFilter} />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty — no orders at all */}
        {!loading && orders.length === 0 && (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            description="When you place your first order, it will appear here. Start browsing our products!"
            action={{ label: 'Browse Products', href: '/products' }}
          />
        )}

        {/* Empty — filtered result */}
        {!loading && orders.length > 0 && filtered.length === 0 && (
          <EmptyState
            emoji="🔍"
            title={`No ${statusFilter} orders`}
            description="Try a different filter to see your orders."
            action={{ label: 'Show All', onClick: () => setStatusFilter('') }}
          />
        )}

        {/* Order list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {/* Result count */}
            <p className="text-sm text-text-secondary">
              {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
              {statusFilter ? ` · ${statusFilter}` : ''}
            </p>

            {filtered.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

