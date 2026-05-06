import Link from 'next/link'

// ── Skeleton placeholder for product cards ──────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-40 w-full rounded-xl mb-4" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2 mb-4" />
      <div className="skeleton h-10 w-full rounded-full" />
    </div>
  )
}

// ── Category placeholder ────────────────────────────────────────────────────
function CategoryChip({ label, emoji }) {
  return (
    <Link
      href={`/products?category=${label.toLowerCase()}`}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border shadow-sm
                 hover:border-primary hover:bg-primary-light transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md min-w-[90px]"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-medium text-text-secondary">{label}</span>
    </Link>
  )
}

// ── How It Works step ───────────────────────────────────────────────────────
function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="page-enter">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="w-full bg-primary text-white py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block bg-white/15 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full tracking-wide uppercase mb-2">
            UNIBEN Students Only 🎓
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Your Campus Bookshop,<br className="hidden md:block" /> Online
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Order stationeries and textbooks from TACSFON Bookshop and get them
            delivered straight to your hostel — no stress, no queues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/products" className="btn-primary bg-white text-primary hover:bg-white/90 text-base px-8">
              Shop Now
            </Link>
            <Link href="/about" className="btn-secondary border-white text-white hover:bg-white/10 text-base px-8">
              Learn More
            </Link>
          </div>
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 pt-4 text-white/70 text-sm">
            <span>✓ Fast delivery</span>
            <span>✓ Verified products</span>
            <span>✓ Secure payment</span>
          </div>
        </div>
      </section>

      {/* ── Popular Items (placeholder → Phase 9 wires up live data) ──────── */}
      <section className="py-14 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Popular Items</h2>
              <p className="text-sm text-text-secondary mt-1">What students are buying this week</p>
            </div>
            <Link href="/products" className="text-primary text-sm font-medium hover:underline underline-offset-4">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
          <p className="text-center text-xs text-text-secondary mt-4">
            Loading products...
          </p>
        </div>
      </section>

      {/* ── Categories (placeholder → Phase 9 wires up live data) ─────────── */}
      <section className="py-14 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Shop by Category</h2>
          <p className="text-sm text-text-secondary mb-8">Find exactly what you need</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <CategoryChip label="Notebooks" emoji="📒" />
            <CategoryChip label="Pens" emoji="🖊️" />
            <CategoryChip label="Textbooks" emoji="📚" />
            <CategoryChip label="Files" emoji="🗂️" />
            <CategoryChip label="Geometry" emoji="📐" />
            <CategoryChip label="Art" emoji="🎨" />
            <CategoryChip label="Others" emoji="📦" />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">How It Works</h2>
          <p className="text-sm text-text-secondary mb-10 text-center">
            Getting your supplies has never been easier
          </p>
          <div className="space-y-8">
            <Step
              number="1"
              title="Browse & Add to Cart"
              description="Explore our catalogue of stationeries, textbooks, and campus essentials. Add what you need to your cart."
            />
            <Step
              number="2"
              title="Checkout & Pay"
              description="Enter your hostel address. We'll generate a unique payment reference. Transfer to our bank account using the ref ID."
            />
            <Step
              number="3"
              title="We Confirm & Dispatch"
              description="Once payment is confirmed, your order is packed and dispatched. You'll get a notification when it's on the way."
            />
            <Step
              number="4"
              title="Receive at Your Hostel"
              description="Your items arrive at your door. Mark as received and download your receipt — all done!"
            />
          </div>
          <div className="text-center mt-12">
            <Link href="/signup" className="btn-primary inline-flex text-base px-10">
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-8 bg-primary-light">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary">Questions? We&apos;re on WhatsApp</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Reach our admin directly for order issues, custom requests, or general enquiries.
          </p>
          <a
            href="https://wa.me/2340000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex gap-2 text-base px-8"
          >
            <span>💬</span> Chat with Admin
          </a>
        </div>
      </section>

    </div>
  )
}
