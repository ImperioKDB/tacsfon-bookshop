'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { productsApi } from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'

// ── Category chips ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Exercise Books',       emoji: '📒' },
  { label: 'Pens & Pencils',       emoji: '🖊️' },
  { label: 'Files & Folders',      emoji: '🗂️' },
  { label: 'Rulers & Geometry',    emoji: '📐' },
  { label: 'Printing Paper',       emoji: '🖨️' },
  { label: 'Calculators',          emoji: '🔢' },
  { label: 'Bibles & Devotionals', emoji: '📖' },
  { label: 'Envelopes',            emoji: '✉️' },
  { label: 'ID Tags',              emoji: '🪪' },
  { label: 'Other',                emoji: '📦' },
]

function CategoryChip({ label, emoji }) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(label)}`}
      className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-2xl border border-border/70
                 hover:border-primary hover:bg-primary-muted transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-sm min-w-[80px]"
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-xs font-semibold text-text-secondary text-center leading-tight">{label}</span>
    </Link>
  )
}

// ── How it works step ─────────────────────────────────────────────────────────

function Step({ number, title, description, isLast = false }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary text-white font-bold
                        flex items-center justify-center text-sm shrink-0 shadow-sm">
          {number}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-primary/15 min-h-[28px] mt-1" />
        )}
      </div>
      <div className={!isLast ? 'pb-7' : ''}>
        <h3 className="font-semibold text-text-primary mb-1 leading-snug">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Product card skeleton ─────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-36 w-full rounded-xl mb-3" />
      <div className="skeleton h-3 w-1/3 mb-2 rounded-full" />
      <div className="skeleton h-4 w-3/4 mb-1 rounded" />
      <div className="skeleton h-4 w-1/2 mb-3 rounded" />
      <div className="skeleton h-10 w-full rounded-full" />
    </div>
  )
}

// ── Trust bar ─────────────────────────────────────────────────────────────────

const TRUST = [
  { icon: '🚀', label: 'Fast hostel delivery' },
  { icon: '✅', label: 'Verified products' },
  { icon: '🔒', label: 'Secure bank transfer' },
  { icon: '📞', label: 'WhatsApp support' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    productsApi.getAll({ limit: 4, page: 1 })
      .then(data => setFeatured(data?.products ?? data ?? []))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false))
  }, [])

  return (
    <div className="page-enter">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-pattern text-white pt-24 pb-28 md:pt-36 md:pb-36 px-4 md:px-8
                          relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 -left-16 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />
        <div className="absolute bottom-16 right-1/4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(255,255,255,0.07) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25
                           text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase">
            🎓 UNIBEN Students Only
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Your Campus Bookshop,<br className="hidden sm:block" /> Online
          </h1>

          <p className="text-base md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            Order stationeries and textbooks from TACSFON Bookshop and get them
            delivered straight to your hostel — no stress, no queues.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/products"
                  className="btn-primary bg-white text-primary hover:bg-white/95
                             text-[15px] px-8 shadow-lg shadow-black/20">
              Shop Now
            </Link>
            <Link href="/about"
                  className="btn-secondary border-white/50 text-white hover:bg-white/10
                             hover:border-white text-[15px] px-8">
              Learn More
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3
                          text-white/55 text-xs font-medium tracking-wide">
            <span className="flex items-center gap-1.5"><span className="text-green-300">✓</span> Fast delivery</span>
            <span className="flex items-center gap-1.5"><span className="text-green-300">✓</span> Verified products</span>
            <span className="flex items-center gap-1.5"><span className="text-green-300">✓</span> Secure payment</span>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
               className="w-full h-[50px] md:h-[70px]" fill="white">
            <path d="M0,35 C360,70 720,0 1080,35 C1260,52 1380,28 1440,35 L1440,70 L0,70 Z"/>
          </svg>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-5
                        flex flex-wrap justify-center md:justify-between gap-x-8 gap-y-3">
          {TRUST.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-text-secondary font-medium">
              <span className="text-base">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Items ─────────────────────────────────────────────────── */}
      <section className="pt-12 pb-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Trending</p>
              <h2 className="text-2xl font-bold text-text-primary">Popular Items</h2>
              <p className="text-sm text-text-secondary mt-0.5">What students are buying this week</p>
            </div>
            <Link href="/products"
                  className="text-primary text-sm font-semibold hover:underline underline-offset-4
                             shrink-0 flex items-center gap-1">
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingFeatured
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.length > 0
                ? featured.map((p, i) => (
                    <div key={p.id}
                         className={`float-up float-up-${i + 1}`}>
                      <ProductCard product={p} />
                    </div>
                  ))
                : (
                  // Fallback if API returns nothing
                  <div className="col-span-2 lg:col-span-4 text-center py-10">
                    <p className="text-text-secondary text-sm">
                      Products loading...{' '}
                      <Link href="/products" className="text-primary font-semibold hover:underline">
                        Browse all →
                      </Link>
                    </p>
                  </div>
                )
            }
          </div>

          {!loadingFeatured && featured.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/products" className="btn-secondary px-10 text-sm">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-primary-muted">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Browse</p>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Shop by Category</h2>
          <p className="text-sm text-text-secondary mb-7">Find exactly what you need</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(({ label, emoji }) => (
              <CategoryChip key={label} label={label} emoji={emoji} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Simple Process</p>
            <h2 className="text-2xl font-bold text-text-primary mb-1">How It Works</h2>
            <p className="text-sm text-text-secondary">Getting your supplies has never been easier</p>
          </div>
          <div>
            <Step number="1" title="Browse & Add to Cart"
              description="Explore our catalogue of stationeries, textbooks, and campus essentials. Add what you need to your cart." />
            <Step number="2" title="Checkout & Pay"
              description="Enter your hostel address. We'll generate a unique payment reference — transfer to our bank account using the ref ID." />
            <Step number="3" title="We Confirm & Dispatch"
              description="Once payment is confirmed, your order is packed and dispatched. You'll get a notification when it's on the way." />
            <Step number="4" title="Receive at Your Hostel"
              description="Your items arrive at your door. Mark as received and download your receipt — all done!"
              isLast />
          </div>
          <div className="text-center mt-12">
            <Link href="/signup" className="btn-primary inline-flex text-[15px] px-10 shadow-sm">
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="bg-primary-muted border-y border-primary/10 py-10 px-4 md:px-8">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: '500+', label: 'Students served' },
            { value: '50+',  label: 'Products in store' },
            { value: '24h',  label: 'Avg. delivery time' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl md:text-3xl font-extrabold text-primary">{value}</p>
              <p className="text-xs md:text-sm text-text-secondary font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WhatsApp CTA ──────────────────────────────────────────────────── */}
      <section className="hero-pattern py-14 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white/15 border border-white/20
                          items-center justify-center mx-auto">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Questions? We&apos;re on WhatsApp</h2>
          <p className="text-white/65 text-sm leading-relaxed">
            Reach our admin directly for order issues, custom requests, or general enquiries.
          </p>
          <a
            href="https://wa.me/2348087672926"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold
                       rounded-full px-8 py-3 text-[15px] min-h-[48px]
                       hover:bg-white/95 hover:-translate-y-0.5 hover:shadow-xl
                       transition-all duration-200 shadow-lg shadow-black/20"
          >
            Chat with Admin
          </a>
        </div>
      </section>

    </div>
  )
}


