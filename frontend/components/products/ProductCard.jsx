'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/hooks/useCart'
import { toastError, toastSuccess } from '@/components/ui/Toast'

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()

  const isOutOfStock = !product.stock_qty || product.stock_qty <= 0

  async function handleAddToCart(e) {
    e.preventDefault()
    if (!user) {
      toastError('Please log in to add items to your cart')
      router.push('/login?redirect=/products')
      return
    }
    try {
      await addToCart({ productId: product.id, quantity: 1 })
      toastSuccess('Added to cart 🛒')
    } catch {
      toastError('Could not add item. Please try again.')
    }
  }

  return (
    <div className="card flex flex-col group animate-fade-in">
      <Link href={`/products/${product.id}`}>

        {/* Image */}
        <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100 mb-3 shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
              <span className="bg-white text-accent text-xs font-bold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Category badge */}
        {product.category && (
          <span className="inline-block text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full mb-1.5">
            {product.category?.name ?? product.category}
          </span>
        )}

        {/* Name */}
        <h3 className="font-semibold text-text-primary text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-primary font-bold text-base mb-3">
          {formatPrice(product.price)}
        </p>
      </Link>

      {/* Add to cart */}
      <div className="mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="btn-primary w-full text-sm py-2.5"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
