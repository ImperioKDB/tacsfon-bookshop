'use client'
import Link from 'next/link'
import OrderStatusBadge from './OrderStatusBadge'

function formatPrice(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function OrderCard({ order }) {
  const itemCount = order.items?.length ?? 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Top row: ID + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">Order</p>
          <p className="font-mono font-semibold text-gray-800 text-sm tracking-wide truncate">
            #{order.id?.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Date + item count */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDate(order.created_at)}</span>
        <span className="text-gray-300">·</span>
        <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Total */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Total</span>
        <span className="text-base font-bold text-gray-900">{formatPrice(order.total)}</span>
      </div>

      {/* CTA */}
      <div className="mt-4">
        <Link
          href={`/orders/${order.id}`}
          className="block w-full text-center py-2.5 rounded-full bg-[#1a5c38] text-white text-sm font-medium
                     hover:bg-[#154d2f] active:scale-95 transition-all duration-200"
        >
          View Order
        </Link>
      </div>
    </div>
  )
}

