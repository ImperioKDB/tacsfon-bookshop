import Link from 'next/link'

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Most orders are delivered within 24 hours of payment confirmation. We deliver to all UNIBEN hostels on campus.',
  },
  {
    q: 'How do I pay for my order?',
    a: 'We use secure bank transfer. After checkout, you\'ll receive our bank details and a unique reference code to use as your transfer narration.',
  },
  {
    q: 'What if an item is out of stock?',
    a: 'Out-of-stock items will show on the product page. You can message us on WhatsApp to enquire about restock timing.',
  },
  {
    q: 'Can I cancel or change my order?',
    a: 'Contact us on WhatsApp as soon as possible. We can make changes before dispatch, but cannot cancel once the order is on its way.',
  },
  {
    q: 'What areas do you deliver to?',
    a: 'We currently deliver to all hostels within the University of Benin main campus.',
  },
  {
    q: 'I made a payment but my order shows unpaid. What do I do?',
    a: 'Payment confirmation is manual. After transferring, click "Notify Admin on WhatsApp" with your reference code so we can verify quickly.',
  },
]

function FaqItem({ q, a }) {
  return (
    <div className="border-b border-border/60 last:border-0 py-5">
      <h3 className="font-semibold text-text-primary mb-2 text-sm">{q}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="page-enter">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-pattern text-white py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25
                           text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase">
            📞 Get in Touch
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Contact & Support
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            We&apos;re here to help. Reach us on WhatsApp for the fastest response.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-[38px]" fill="white">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,18 1440,25 L1440,50 L0,50 Z"/>
          </svg>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Contact Cards ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary mb-2">Reach Us Directly</h2>

            {/* WhatsApp — primary */}
            <a
              href="https://wa.me/2348087672926"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 bg-[#e8f5ee] border border-primary/15 rounded-2xl
                         hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary text-sm">WhatsApp (Fastest)</p>
                <p className="text-primary/80 font-mono text-sm mt-0.5">+234 808 767 2926</p>
                <p className="text-xs text-primary/60 mt-1">Tap to open WhatsApp →</p>
              </div>
            </a>

            {/* Hours */}
            <div className="flex items-start gap-4 p-5 bg-white border border-border/60 rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-primary-muted flex items-center justify-center shrink-0">
                <span className="text-xl">🕐</span>
              </div>
              <div>
                <p className="font-bold text-text-primary text-sm">Support Hours</p>
                <p className="text-text-secondary text-sm mt-1">Mon – Fri: 8:00 AM – 8:00 PM</p>
                <p className="text-text-secondary text-sm">Sat – Sun: 9:00 AM – 5:00 PM</p>
                <p className="text-xs text-text-secondary/70 mt-1.5">
                  WhatsApp messages are answered fastest during these hours.
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 p-5 bg-white border border-border/60 rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-primary-muted flex items-center justify-center shrink-0">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <p className="font-bold text-text-primary text-sm">Physical Location</p>
                <p className="text-text-secondary text-sm mt-1">TACSFON Bookshop</p>
                <p className="text-text-secondary text-sm">University of Benin</p>
                <p className="text-text-secondary text-sm">Benin City, Edo State</p>
              </div>
            </div>

            {/* Order issue shortcut */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1">
                Order Issue?
              </p>
              <p className="text-sm text-yellow-700 leading-relaxed mb-3">
                If you have an issue with an existing order, the fastest route is WhatsApp with your order reference ID.
              </p>
              <Link href="/orders" className="text-xs font-semibold text-primary hover:underline">
                View My Orders →
              </Link>
            </div>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-5">
              Frequently Asked Questions
            </h2>
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm px-5">
              {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
            </div>

            <div className="mt-4 bg-primary-muted rounded-2xl border border-primary/10 p-4 text-center">
              <p className="text-sm text-text-secondary mb-2">
                Didn&apos;t find your answer?
              </p>
              <a
                href="https://wa.me/2348087672926?text=Hi, I have a question about TACSFON Bookshop."
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline underline-offset-2"
              >
                Ask us on WhatsApp →
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
