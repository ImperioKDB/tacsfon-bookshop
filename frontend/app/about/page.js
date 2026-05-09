import Link from 'next/link'

const TEAM = [
  {
    name: 'TACSFON Executives',
    role: 'Management & Operations',
    initials: 'TE',
  },
]

const VALUES = [
  {
    emoji: '🎯',
    title: 'Student-First',
    description: 'Everything we do is designed around the needs of UNIBEN students — affordable prices, convenient delivery, and reliable service.',
  },
  {
    emoji: '🤝',
    title: 'Trustworthy',
    description: 'We are the official bookshop of the The Apostolic Church Students Fellowship of Nigeria. Your orders are in safe hands.',
  },
  {
    emoji: '⚡',
    title: 'Efficient',
    description: 'We understand the hustle. Quick order processing and same-day hostel delivery means less time running around campus.',
  },
  {
    emoji: '💚',
    title: 'Community-Driven',
    description: 'We reinvest in our community. TACSFON exists to serve its members and the wider UNIBEN student body.',
  },
]

export default function AboutPage() {
  return (
    <div className="page-enter">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-pattern text-white py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25
                           text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase mb-5">
            🎭 Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
            About TACSFON Bookshop
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re the official bookshop of the The Apostolic Church Students
            Fellowship of Nigeria, University of Benin — bringing campus essentials directly to your hostel.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[45px]" fill="white">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,22 1440,30 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Our Purpose</p>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Why We Exist</h2>
          </div>

          <div className="bg-primary-muted rounded-3xl border border-primary/10 p-8 md:p-10 text-center mb-10">
            <p className="text-xl md:text-2xl font-semibold text-primary leading-relaxed">
              &ldquo;To make campus life easier by putting essential stationeries and textbooks
              a few taps away — delivered to your door.&rdquo;
            </p>
          </div>

          <p className="text-text-secondary text-base leading-relaxed text-center max-w-2xl mx-auto">
            Before TACSFON Bookshop went online, getting supplies meant long walks across campus,
            crowded stores, and stock uncertainty. We built this platform to change that — giving
            every UNIBEN student a faster, more reliable way to shop.
          </p>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-primary-muted">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">What Drives Us</p>
            <h2 className="text-2xl font-bold text-text-primary">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {VALUES.map(({ emoji, title, description }) => (
              <div key={title} className="bg-white rounded-2xl border border-border/60 shadow-sm p-6
                                          hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <span className="text-3xl mb-3 block">{emoji}</span>
                <h3 className="font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How we deliver ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Delivery</p>
            <h2 className="text-2xl font-bold text-text-primary mb-2">How Delivery Works</h2>
            <p className="text-sm text-text-secondary">We deliver to all UNIBEN hostels on campus</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '🏠', title: 'Hostel Delivery', desc: 'We deliver directly to your hostel room. Provide your hostel name and room number at checkout.' },
              { icon: '⏱️', title: 'Delivery Time', desc: 'Most orders are delivered within 24 hours of payment confirmation. Monday to Saturday' },
              { icon: '📦', title: 'Order Tracking', desc: 'Track your order status in real time from the My Orders page — from placement to delivery.' },
              { icon: '💳', title: 'Payment', desc: 'We use secure bank transfer. You\'ll get a unique reference code to use as your transfer narration.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-border/60">
                <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="hero-pattern py-14 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="max-w-xl mx-auto text-center space-y-5 relative z-10">
          <h2 className="text-2xl font-bold text-white">Ready to Shop?</h2>
          <p className="text-white/65 text-sm leading-relaxed">
            Browse our catalogue and get your supplies delivered to your hostel today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products"
                  className="inline-flex items-center justify-center bg-white text-primary font-bold
                             rounded-full px-8 py-3 text-[15px] min-h-[48px]
                             hover:bg-white/95 hover:-translate-y-0.5 hover:shadow-xl
                             transition-all duration-200 shadow-lg shadow-black/20">
              Browse Products
            </Link>
            <Link href="/contact"
                  className="inline-flex items-center justify-center border-2 border-white/50 text-white font-bold
                             rounded-full px-8 py-3 text-[15px] min-h-[48px]
                             hover:bg-white/10 hover:border-white transition-all duration-200">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

