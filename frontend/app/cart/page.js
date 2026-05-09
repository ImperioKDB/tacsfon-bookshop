'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/spinner'
import { toastError, toastSuccess } from '@/components/ui/Toast'

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

// ── Single cart item row ─────────────────────────────────────────────────────

function CartItemRow({ item, onUpdate, onRemove }) {
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)

  const product = item.product
  const maxQty  = product?.stock_qty ?? 99
  const lineTotal = formatPrice(item.quantity * Number(product?.price ?? 0))

  async function handleQtyChange(newQty) {
    if (newQty < 1 || newQty > maxQty || updating) return
    setUpdating(true)
    try {
      await onUpdate(item.id, newQty)
    } catch {
      toastError('Could not update quantity. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  async function handleRemove() {
    if (removing) return
    setRemoving(true)
    try {
      await onRemove(item.id)
      toastSuccess('Item removed from cart')
    } catch {
      toastError('Could not remove item. Please try again.')
      setRemoving(false) // only reset on failure — on success the item unmounts
    }
  }

  return (
    <div
      className={`
        flex gap-3 py-4 border-b border-border last:border-0
        transition-opacity duration-300
        ${removing ? 'opacity-40 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Product image */}
      <Link href={`/products/${product?.id}`} className="shrink-0">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100
                        ring-1 ring-border hover:ring-primary transition-all duration-200">
          {product?.image_url ? (
            <Image
              src={product.image_url}
              alt={product?.name ?? 'Product'}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl select-none">
              📦
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">

        {/* Category badge */}
        {product?.category && (
          <span className="inline-block text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full mb-1">
            {product.category?.name ?? product.category}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product?.id}`}>
          <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2
                         hover:text-primary transition-colors duration-200">
            {product?.name ?? 'Unknown product'}
          </h3>
        </Link>

        {/* Unit price */}
        <p className="text-primary font-bold text-sm mt-0.5">
          {formatPrice(product?.price)}
        </p>

        {/* Bottom row: qty stepper + line total + remove */}
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">

          {/* Quantity stepper */}
          <div className="flex items-center gap-0.5 bg-gray-50 border border-border rounded-xl px-1 py-0.5">
            <button
              onClick={() => handleQtyChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
              aria-label="Decrease quantity"
              className="w-7 h-7 flex items-center justify-center rounded-lg font-bold text-base
                         text-text-secondary hover:text-primary hover:bg-white
                         transition-all duration-150
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>

            <span className="w-7 text-center text-sm font-semibold text-text-primary select-none">
              {updating ? (
                <span className="inline-flex justify-center">
                  <Spinner size="sm" color="gray" />
                </span>
              ) : item.quantity}
            </span>

            <button
              onClick={() => handleQtyChange(item.quantity + 1)}
              disabled={item.quantity >= maxQty || updating}
              aria-label="Increase quantity"
              className="w-7 h-7 flex items-center justify-center rounded-lg font-bold text-base
                         text-text-secondary hover:text-primary hover:bg-white
                         transition-all duration-150
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-semibold text-text-secondary ml-1">
            = {lineTotal}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={removing}
            aria-label="Remove item"
            className="flex items-center gap-1 text-xs text-text-secondary
                       hover:text-accent transition-colors duration-200 px-2 py-1 rounded-lg
                       hover:bg-red-50 min-h-[32px]"
          >
            {removing ? (
              <Spinner size="sm" color="gray" />
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                </svg>
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Order summary panel ──────────────────────────────────────────────────────

function OrderSummary({ cartCount, cartTotal }) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 md:sticky md:top-24">

      <h2 className="font-bold text-text-primary text-base mb-4">Order Summary</h2>

      {/* Line items */}
      <div className="space-y-2.5 text-sm pb-4 border-b border-border">
        <div className="flex justify-between">
          <span className="text-text-secondary">
            Items ({cartCount})
          </span>
          <span className="font-medium text-text-primary">
            {formatPrice(cartTotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Delivery</span>
          <span className="text-green-600 font-medium text-xs">
            Calculated at checkout
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 mb-5">
        <span className="font-bold text-text-primary">Subtotal</span>
        <span className="font-extrabold text-primary text-lg">
          {formatPrice(cartTotal)}
        </span>
      </div>

      {/* CTA */}
      <Link
        href="/checkout"
        className="btn-primary w-full text-[15px] shadow-sm"
      >
        Proceed to Checkout
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>

      {/* Trust signal */}
      <p className="text-center text-xs text-text-secondary mt-3 flex items-center justify-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Secure, verified payment
      </p>

      {/* WhatsApp help */}
      <div className="mt-4 pt-4 border-t border-border text-center">
        <p className="text-xs text-text-secondary mb-1">Need help with your order?</p>
        <a
          href="https://wa.me/2348087672926"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary font-medium hover:underline underline-offset-4"
        >
          Chat with Admin on WhatsApp →
        </a>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { cartItems, cartCount, cartTotal, loading, updateQuantity, removeFromCart } = useCart()

  // Initial cart fetch is loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          description="You haven't added anything yet. Browse our products and find what you need."
          action={{ label: 'Browse Products', href: '/products' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Your Cart</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Two-column layout on md+ */}
        <div className="grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Left — item list */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
            {cartItems.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}

            {/* Continue shopping link */}
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-primary text-sm
                           font-medium hover:underline underline-offset-4 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right — order summary */}
          <OrderSummary cartCount={cartCount} cartTotal={cartTotal} />

        </div>
      </div>
    </div>
  )
}

