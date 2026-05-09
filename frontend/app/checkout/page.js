'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { ordersApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[
        { n: 1, label: 'Delivery' },
        { n: 2, label: 'Payment' },
      ].map(({ n, label }, idx) => (
        <div key={n} className="flex items-center gap-2">
          {idx > 0 && (
            <div className={`h-px w-10 transition-colors duration-300 ${step >= n ? 'bg-primary' : 'bg-border'}`} />
          )}
          <div className="flex items-center gap-1.5">
            <div className={`
              w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
              transition-all duration-300
              ${step >= n
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary border border-border'}
            `}>
              {step > n ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : n}
            </div>
            <span className={`text-xs font-medium ${step >= n ? 'text-primary' : 'text-text-secondary'}`}>
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Order summary (compact, right column) ────────────────────────────────────

function CheckoutSummary({ cartItems, cartTotal }) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
      <h3 className="font-semibold text-text-primary text-sm mb-3">
        Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
      </h3>

      <div className="space-y-2.5 mb-4 max-h-52 overflow-y-auto pr-1">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm gap-2">
            <span className="text-text-secondary line-clamp-2 flex-1">
              {item.product?.name}
              <span className="text-text-secondary/60 ml-1">×{item.quantity}</span>
            </span>
            <span className="font-medium text-text-primary shrink-0">
              {formatPrice(item.quantity * Number(item.product?.price ?? 0))}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 flex justify-between">
        <span className="font-bold text-text-primary text-sm">Total</span>
        <span className="font-extrabold text-primary">{formatPrice(cartTotal)}</span>
      </div>
    </div>
  )
}

// ── Payment confirmation screen ───────────────────────────────────────────────

function PaymentConfirmation({ order, bankDetails }) {
  const [copied, setCopied] = useState(null)
  const router = useRouter()

  function copy(value, key) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const details = [
    { label: 'Bank',           value: bankDetails.bankName,       key: 'bank' },
    { label: 'Account Number', value: bankDetails.accountNumber,  key: 'acct' },
    ...(bankDetails.accountName
      ? [{ label: 'Account Name', value: bankDetails.accountName, key: 'name' }]
      : []),
    { label: 'Amount',         value: formatPrice(order.total),   key: 'amt'  },
    { label: 'Reference',      value: order.ref_id,               key: 'ref'  },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Success header */}
      <div className="text-center mb-7">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text-primary">Order Placed!</h1>
        <p className="text-text-secondary text-sm mt-1">
          Complete your payment by transferring to the account below.
        </p>
      </div>

      {/* Bank transfer card */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                 className="text-primary">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <path d="M1 10h22"/>
            </svg>
          </div>
          <span className="font-semibold text-text-primary text-sm">Bank Transfer Details</span>
        </div>

        <div className="space-y-3">
          {details.map(({ label, value, key }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 px-3 bg-gray-50
                         rounded-xl border border-border/50"
            >
              <div>
                <p className="text-xs text-text-secondary mb-0.5">{label}</p>
                <p className={`font-semibold text-text-primary ${key === 'ref' ? 'text-primary tracking-wide' : ''}`}>
                  {value}
                </p>
              </div>
              {/* Copy button for account number and ref_id */}
              {(key === 'acct' || key === 'ref' || key === 'amt') && (
                <button
                  onClick={() => copy(value, key)}
                  className="ml-3 shrink-0 flex items-center gap-1 text-xs text-primary
                             hover:bg-primary/10 px-2 py-1.5 rounded-lg transition-colors"
                >
                  {copied === key ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Important notice */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-800 font-medium flex gap-2">
            <span className="shrink-0">⚠️</span>
            <span>
              Use your reference code <strong>{order.ref_id}</strong> as the transfer narration.
              Your order will be confirmed once payment is verified.
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <a
          href={`https://wa.me/2348087672926?text=Hi%2C%20I%20just%20placed%20order%20${order.ref_id}%20and%20have%20made%20the%20payment.`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full text-[15px] justify-center"
        >
          {/* WhatsApp icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
          Notify Admin on WhatsApp
        </a>

        <button
          onClick={() => router.push('/orders')}
          className="btn-secondary w-full text-[15px] justify-center"
        >
          Track My Order
        </button>
      </div>
    </div>
  )
}

// ── Delivery form ─────────────────────────────────────────────────────────────

function DeliveryForm({ profile, onSubmit, submitting, serverError }) {
  const [form, setForm] = useState({
    customer_name:    profile?.full_name ?? '',
    phone:            profile?.phone ?? '',
    hostel:           '',
    room:             '',
    notes:            '',
  })
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'Full name is required'
    if (!form.phone.trim())         e.phone         = 'Phone number is required'
    if (!form.hostel.trim())        e.hostel        = 'Hostel name is required'
    if (!form.room.trim())          e.room          = 'Room number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const delivery_address = `${form.hostel.trim()}, Room ${form.room.trim()}`
    onSubmit({
      customer_name:    form.customer_name.trim(),
      phone:            form.phone.trim(),
      delivery_address,
      notes:            form.notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Full name */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Full Name *
        </label>
        <input
          type="text"
          value={form.customer_name}
          onChange={e => set('customer_name', e.target.value)}
          placeholder="e.g. Bright Omoike"
          className={`input-field ${errors.customer_name ? 'border-red-400 focus:ring-red-300' : ''}`}
        />
        {errors.customer_name && (
          <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Phone Number *
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="e.g. 08012345678"
          className={`input-field ${errors.phone ? 'border-red-400 focus:ring-red-300' : ''}`}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Hostel + Room — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Hostel Name *
          </label>
          <input
            type="text"
            value={form.hostel}
            onChange={e => set('hostel', e.target.value)}
            placeholder="e.g. Mariere Hall"
            className={`input-field ${errors.hostel ? 'border-red-400 focus:ring-red-300' : ''}`}
          />
          {errors.hostel && (
            <p className="text-red-500 text-xs mt-1">{errors.hostel}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Room Number *
          </label>
          <input
            type="text"
            value={form.room}
            onChange={e => set('room', e.target.value)}
            placeholder="e.g. 14B"
            className={`input-field ${errors.room ? 'border-red-400 focus:ring-red-300' : ''}`}
          />
          {errors.room && (
            <p className="text-red-500 text-xs mt-1">{errors.room}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Delivery Note <span className="text-text-secondary/60">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any special instructions for delivery..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full text-[15px] mt-2 shadow-sm"
      >
        {submitting ? (
          <>
            <Spinner size="sm" color="white" />
            Placing Order…
          </>
        ) : (
          <>
            Place Order
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { cartItems, cartTotal, loading: cartLoading, clearCart } = useCart()
  const { user, profile }  = useAuth()
  const router = useRouter()

  const [step, setStep]               = useState(1)          // 1 = form, 2 = confirmation
  const [submitting, setSubmitting]   = useState(false)
  const [serverError, setServerError] = useState('')
  const [orderResult, setOrderResult] = useState(null)       // { order, bankDetails }

  // Redirect unauthenticated users
  if (!cartLoading && !user) {
    router.replace('/login?redirect=/checkout')
    return null
  }

  // Empty cart guard
  if (!cartLoading && cartItems.length === 0 && step === 1) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          emoji="🛒"
          title="Nothing to check out"
          description="Your cart is empty. Add some items before checking out."
          action={{ label: 'Browse Products', href: '/products' }}
        />
      </div>
    )
  }

  async function handlePlaceOrder(payload) {
    setSubmitting(true)
    setServerError('')

    try {
      const result = await ordersApi.initiate(payload)
      // Clear local cart state (server already cleared DB cart)
      clearCart()
      setOrderResult(result)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setServerError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Confirmation screen bypasses the two-column layout
  if (step === 2 && orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 page-enter">
        <PaymentConfirmation
          order={orderResult.order}
          bankDetails={orderResult.bankDetails}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary
                       hover:text-primary transition-colors mb-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Checkout</h1>
        </div>

        <StepIndicator step={step} />

        {/* Two-column layout on md+ */}
        <div className="grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Left — form */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
            <h2 className="font-semibold text-text-primary mb-4 text-base">Delivery Details</h2>
            {cartLoading ? (
              <div className="flex justify-center py-8"><Spinner size="lg" /></div>
            ) : (
              <DeliveryForm
                profile={profile}
                onSubmit={handlePlaceOrder}
                submitting={submitting}
                serverError={serverError}
              />
            )}
          </div>

          {/* Right — order summary */}
          {!cartLoading && (
            <CheckoutSummary cartItems={cartItems} cartTotal={cartTotal} />
          )}

        </div>
      </div>
    </div>
  )
}
