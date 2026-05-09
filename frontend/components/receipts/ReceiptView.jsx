'use client'
import Image from 'next/image'

function formatPrice(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * ReceiptView
 * Props:
 *   receipt: {
 *     id, ref_id, created_at,
 *     customer: { full_name, email, phone },
 *     delivery_address, city,
 *     items: [{ name, quantity, unit_price, subtotal }],
 *     total,
 *   }
 */
export default function ReceiptView({ receipt }) {
  if (!receipt) return null

  const { ref_id, created_at, customer, delivery_address, city, items = [], total } = receipt

  return (
    <div
      id="receipt-printable"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto"
    >
      {/* Header band */}
      <div className="bg-[#1a5c38] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo — falls back gracefully if not present */}
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
            <span className="text-[#1a5c38] font-black text-xs">T</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">TACSFON Bookshop</p>
            <p className="text-[#a8d5bc] text-xs">University of Benin</p>
          </div>
        </div>
        {/* PAID stamp */}
        <div className="border-2 border-white rounded-lg px-3 py-1 rotate-[-6deg]">
          <span className="text-white font-black text-sm tracking-widest">PAID</span>
        </div>
      </div>

      {/* Receipt meta */}
      <div className="px-6 py-4 border-b border-dashed border-gray-200 flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <p className="text-xs text-gray-400">Receipt ID</p>
          <p className="text-sm font-mono font-semibold text-gray-800">{ref_id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Date</p>
          <p className="text-sm font-semibold text-gray-800">{formatDate(created_at)}</p>
        </div>
      </div>

      {/* Customer info */}
      <div className="px-6 py-4 border-b border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Customer</p>
          <p className="text-sm font-semibold text-gray-900">{customer?.full_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{customer?.email}</p>
          {customer?.phone && (
            <p className="text-xs text-gray-500">{customer.phone}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Delivery Address</p>
          <p className="text-sm text-gray-700 leading-snug">
            {delivery_address}
            {city ? `, ${city}` : ''}
          </p>
        </div>
      </div>

      {/* Items table */}
      <div className="px-6 py-4 border-b border-dashed border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>

        {/* Header — hidden on very small screens */}
        <div className="hidden sm:grid grid-cols-12 text-xs text-gray-400 font-medium pb-2 border-b border-gray-100 mb-2">
          <span className="col-span-5">Product</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Unit</span>
          <span className="col-span-3 text-right">Subtotal</span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-1 text-sm">
              <span className="col-span-12 sm:col-span-5 font-medium text-gray-900 leading-snug">
                {item.name}
              </span>
              <span className="col-span-4 sm:col-span-2 text-gray-500 sm:text-center text-xs">
                <span className="sm:hidden text-gray-400">×</span>{item.quantity}
              </span>
              <span className="col-span-4 sm:col-span-2 text-gray-500 text-right sm:text-right text-xs">
                {formatPrice(item.unit_price)}
              </span>
              <span className="col-span-4 sm:col-span-3 font-semibold text-gray-800 text-right">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Payment Reference</p>
          <p className="text-xs font-mono text-gray-600 mt-0.5">{ref_id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Grand Total</p>
          <p className="text-2xl font-black text-[#1a5c38]">{formatPrice(total)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#e8f5ee] px-6 py-3 text-center">
        <p className="text-xs text-[#1a5c38]">
          Thank you for shopping with TACSFON Bookshop 📚
        </p>
      </div>
    </div>
  )
}

