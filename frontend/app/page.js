import Link        from 'next/link'
import { Suspense } from 'react'
import { productsApi, categoriesApi } from '@/lib/api'
import ProductCard  from '@/components/products/ProductCard'

// Cache this page on Vercel CDN for 5 minutes.
// One real Render fetch per 5 min — visitors never wait on Render.
export const revalidate = 300

async function getFeaturedProducts() {
  try {
    const data = await productsApi.getAll({ limit: 6, page: 1 })
    return data?.products ?? data ?? []
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const data = await categoriesApi.getAll()
    return data?.categories ?? data ?? []
  } catch {
    return []
  }
}

// Skeleton shown while CatalogSection streams in
function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
      <div className="flex flex-wrap gap-2 mb-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border">
            <div className="aspect-square bg-gray-100 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Async section — fetches products + categories, streamed after hero
async function CatalogSection() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <>
      {categories.length > 0 && (
        <section className="bg-gray-50 py-12 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Shop by Category</h2>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                View all →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-2 bg-white border border-border rounded-full
                             px-4 py-2 text-sm font-medium text-text-primary
                             hover:border-primary hover:text-primary transition-all duration-200"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Featured Products</h2>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length === 0 && categories.length === 0 && (
        <section className="bg-white py-14 text-center">
          <p className="text-text-secondary text-sm">No products available yet.</p>
        </section>
      )}
    </>
  )
}

export default function HomePage() {
  return (
    <div className="page-enter">

      {/* Hero — no data dependency, renders instantly */}
      <section className="bg-gradient-to-br from-primary via-primary to-[#154d2f] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold
                           px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            📚 TACSFON Official Bookshop
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5 max-w-3xl">
            Your campus bookshop,{' '}
            <span className="text-white/80">delivered to your hostel</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-8">
            Order textbooks, stationery and more. Get them delivered right to your room.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/products"
                  className="bg-white text-primary font-bold px-8 py-3.5 rounded-full
                             hover:bg-white/90 transition-all duration-200 active:scale-95 text-sm">
              Browse Products
            </Link>
            <Link href="/signup"
                  className="bg-white/15 text-white font-semibold px-8 py-3.5 rounded-full
                             hover:bg-white/25 transition-all duration-200 active:scale-95 text-sm
                             border border-white/30 backdrop-blur-sm">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — static, renders instantly */}
      <section className="bg-white py-14 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '🛒', step: '1', title: 'Browse & Add to Cart', desc: 'Browse our catalogue and add items to your cart.' },
              { emoji: '📋', step: '2', title: 'Place Your Order',      desc: 'Checkout with your hostel details and transfer payment.' },
              { emoji: '🚚', step: '3', title: 'Get Delivered',         desc: 'We deliver straight to your hostel room.' },
            ].map(({ emoji, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-2xl">
                  {emoji}
                </div>
                <h3 className="font-bold text-text-primary">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories + Products — streamed behind skeleton */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogSection />
      </Suspense>

      {/* CTA — static */}
      <section className="bg-primary text-white py-14">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Ready to order?
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            Join hundreds of UNIBEN students already using TACSFON Bookshop.
          </p>
          <Link href="/signup"
                className="inline-block bg-white text-primary font-bold px-10 py-3.5
                           rounded-full hover:bg-white/90 transition-all duration-200
                           active:scale-95 text-sm">
            Create Free Account
          </Link>
        </div>
      </section>

    </div>
  )
}
