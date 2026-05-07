'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { productsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/hooks/useCart'
import { toastError, toastSuccess } from '@/components/ui/Toast'
import Spinner from '@/components/ui/spinner'

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function Skeleton({ className }) {
  return <div className={`skeleton rounded ${className}`} />
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="md:flex gap-10">
        <Skeleton className="h-72 w-full md:w-80 rounded-2xl mb-6 md:mb-0 shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-7 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-12 w-full rounded-full mt-6" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!id) return
    productsApi.getById(id)
      .then(data => setProduct(data?.product ?? data))
      .catch(() => {
        toastError('Product not found.')
        router.push('/products')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <ProductDetailSkeleton />
  if (!product) return null

  const isOutOfStock = !product.stock_qty || product.stock_qty <= 0
  const maxQty = product.stock_qty || 1
  const lowStock = product.stock_qty > 0 && product.stock_qty <= 5

  async function handleAddToCart() {
    if (!user) {
      toastError('Please log in to add items to your cart')
      router.push(`/login?redirect=/products/${id}`)
      return
    }
    setAdding(true)
    try {
      await addToCart({ productId: product.id, quantity })
      toastSuccess(`${quantity} × ${product.name} added to cart 🛒`)
    } catch {
      toastError('Could not add to cart. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="page-enter min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>›</span>
          <span className="text-text-primary font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:flex gap-10 items-start">

          {/* Image */}
          <div className="relative h-64 md:h-80 w-full md:w-72 rounded-xl overflow-hidden bg-gray-100 mb-6 md:mb-0 shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 288px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">

            {/* Category */}
            {product.category && (
              <span className="inline-block text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full mb-3">
                {product.category?.name ?? product.category}
              </span>
            )}

            {/* Name */}
            <h1 className="text-2xl font-bold text-text-primary leading-tight mb-2">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>

            {/* Stock indicator */}
            <div className="mb-5">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Out of Stock
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Only {product.stock_qty} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  In Stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Quantity selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-medium text-text-primary">Qty:</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-lg text-text-primary
                               hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold text-sm text-text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center text-lg text-text-primary
                               hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className="btn-primary w-full md:w-auto px-10 text-base"
            >
              {adding ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Adding...
                </span>
              ) : isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>

            {/* Guest nudge */}
            {!user && (
              <p className="text-xs text-text-secondary mt-3">
                <Link href={`/login?redirect=/products/${id}`} className="text-primary font-medium hover:underline">
                  Sign in
                </Link>{' '}to add items to your cart.
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  )
    }
