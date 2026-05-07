import ProductCard from './ProductCard'

function ProductCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-40 w-full rounded-xl mb-3" />
      <div className="skeleton h-4 w-1/3 mb-2 rounded-full" />
      <div className="skeleton h-4 w-3/4 mb-1 rounded" />
      <div className="skeleton h-4 w-1/2 mb-3 rounded" />
      <div className="skeleton h-10 w-full rounded-full" />
    </div>
  )
}

export default function ProductGrid({ products, loading, loadingMore }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📭</p>
        <p className="font-semibold text-text-primary text-lg">No products found</p>
        <p className="text-text-secondary text-sm mt-1">Try a different search or category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {loadingMore && [...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={`more-${i}`} />
      ))}
    </div>
  )
}
