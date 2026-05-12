'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { productsApi, categoriesApi } from '@/lib/api'
import ProductGrid from '@/components/products/ProductGrid'
import CategoryFilter from '@/components/products/CategoryFilter'
import SearchBar from '@/components/products/SearchBar'
import { toastError } from '@/components/ui/Toast'

const LIMIT = 12

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category') ?? ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch categories once on mount
  useEffect(() => {
    categoriesApi.getAll()
      .then(data => {
        const cats = data?.categories ?? data ?? []
        setCategories(cats)

        // If the URL had a category name (from homepage chip), resolve it to the
        // matching category id so CategoryFilter highlights the correct pill.
        if (categoryFromUrl) {
          const match = cats.find(
            c => c.name.toLowerCase() === categoryFromUrl.toLowerCase()
          )
          if (match) setSelectedCategory(match.id)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once; categoryFromUrl is stable on mount

  // Fetch products whenever search or category changes
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setPage(1)
    try {
      const data = await productsApi.getAll({
        search: debouncedSearch || undefined,
        category_id: selectedCategory || undefined,
        page: 1,
        limit: LIMIT,
      })
      const items = data?.products ?? data ?? []
      setProducts(items)
      setHasMore(items.length === LIMIT)
    } catch {
      toastError('Connection error. Please check your internet.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedCategory])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const data = await productsApi.getAll({
        search: debouncedSearch || undefined,
        category_id: selectedCategory || undefined,
        page: nextPage,
        limit: LIMIT,
      })
      const items = data?.products ?? data ?? []
      setProducts(prev => [...prev, ...items])
      setPage(nextPage)
      setHasMore(items.length === LIMIT)
    } catch {
      toastError('Could not load more products. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }

  function handleCategoryChange(categoryId) {
    setSelectedCategory(categoryId)
    setSearch('')
  }

  return (
    <div className="page-enter min-h-screen bg-gray-50">

      <div className="bg-white border-b border-border px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Browse Products</h1>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {categories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />
          </div>
        )}

        {!loading && products.length > 0 && (
          <p className="text-sm text-text-secondary mb-4">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {debouncedSearch ? ` for "${debouncedSearch}"` : ''}
          </p>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          loadingMore={loadingMore}
        />

        {!loading && hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-secondary px-10"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="page-enter min-h-screen bg-gray-50">
        <div className="bg-white border-b border-border px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="skeleton h-8 w-48 mb-4 rounded" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton h-40 w-full rounded-xl mb-3" />
                <div className="skeleton h-4 w-1/3 mb-2 rounded-full" />
                <div className="skeleton h-4 w-3/4 mb-1 rounded" />
                <div className="skeleton h-4 w-1/2 mb-3 rounded" />
                <div className="skeleton h-10 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
