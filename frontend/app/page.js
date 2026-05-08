import Link from 'next/link'

function ProductCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-36 w-full rounded-xl mb-3" />
      <div className="skeleton h-3 w-1/3 mb-2 rounded-full" />
      <div className="skeleton h-4 w-3/4 mb-1 rounded" />
      <div className="skeleton h-4 w-1/2 mb-3 rounded" />
      <div className="skeleton h-10 w-full rounded-full" />
    </div>
  )
}

function CategoryChip({ label, emoji }) {
  return (
    <Link
      href={`/products?category=${label.toLowerCase()}`}
      className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-2xl border border-border/70
                 hover:border-primary hover:bg-primary-muted transition-all duration-200
                 hover:translate-y-[-2px] hover:shadow-sm min-w-[80px]"
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
    </Link>
  )
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-text-primary mb-1 leading-snug">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="page-enter">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-pattern text-white py-24 md:py-36 px-4 md:px-8 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold
                           px-4 py-1.5 rounded-full tracking-wider uppercase border border-white/20">
            🎓 UNIBEN Students Only
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Your Campus Bookshop,<br className="hidden sm:block" /> Online
          </h1>
          <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Order stationeries and textbooks from TACSFON Bookshop and get them
            delivered straight to your hostel — no stress, no queues.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/products"
                  className="btn-primary bg-white text-primary hover:bg-white/95 text-[15px] px-8 shadow-md">
              Shop Now
            </Link>
            <Link href="/about"
                  className="btn-secondary border-white/60 text-white hover:bg-white/10 hover:border-white text-[15px] px-8">
              Learn More
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 pt-3 text-white/60 text-xs font-medium tracking-wide">
            <span className="flex items-center gap-1.5">
              <span className="text-white/80">✓</span> Fast delivery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-white/80">✓</span> Verified products
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-white/80">✓</span> Secure payment
            </span>
          </div>
        </div>
      </section>

      {/* ── Popular Items ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Popular Items</h2>
              <p className="text-sm text-text-secondary mt-0.5">What students are buying this week</p>
            </div>
            <Link href="/products"
                  className="text-primary text-sm font-semibold hover:underline underline-offset-4 shrink-0">
              See all →
            </Link>
          </div>
          {/* 2 cols on mobile, 4 on desktop — 4 skeletons = 2+2 rows on mobile, 1 row on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-primary-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Shop by Category</h2>
          <p className="text-sm text-text-secondary mb-7">Find exactly what you need</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <CategoryChip label="Notebooks" emoji="📒" />
            <CategoryChip label="Pens"      emoji="🖊️" />
            <CategoryChip label="Textbooks" emoji="📚" />
            <CategoryChip label="Files"     emoji="🗂️" />
            <CategoryChip label="Geometry"  emoji="📐" />
            <CategoryChip label="Art"       emoji="🎨" />
            <CategoryChip label="Others"    emoji="📦" />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-1 text-center">How It Works</h2>
          <p className="text-sm text-text-secondary mb-10 text-center">
            Getting your supplies has never been easier
          </p>
          <div className="space-y-7">
            <Step number="1" title="Browse & Add to Cart"
              description="Explore our catalogue of stationeries, textbooks, and campus essentials. Add what you need to your cart." />
            <Step number="2" title="Checkout & Pay"
              description="Enter your hostel address. We'll generate a unique payment reference. Transfer to our bank account using the ref ID." />
            <Step number="3" title="We Confirm & Dispatch"
              description="Once payment is confirmed, your order is packed and dispatched. You'll get a notification when it's on the way." />
            <Step number="4" title="Receive at Your Hostel"
              description="Your items arrive at your door. Mark as received and download your receipt — all done!" />
          </div>
          <div className="text-center mt-12">
            <Link href="/signup" className="btn-primary inline-flex text-[15px] px-10 shadow-sm">
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-primary-muted">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary">Questions? We&apos;re on WhatsApp</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Reach our admin directly for order issues, custom requests, or general enquiries.
          </p>
          <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer"
             className="btn-primary inline-flex text-[15px] px-8">
            💬 Chat with Admin
          </a>
        </div>
      </section>

    </div>
  )
        }
