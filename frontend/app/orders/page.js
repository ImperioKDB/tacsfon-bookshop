'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ordersApi } from '@/lib/api'
import OrderCard from '@/components/orders/OrderCard'
import { toastError } from '@/components/ui/Toast'

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
    </div>
  )
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">No orders yet</h3>
      <p className="text-text-secondary text-sm mb-6 max-w-xs leading-relaxed">
        You haven't placed any orders. Browse our catalogue to get started.
      </p>
      <Link href="/products" className="btn-primary px-8 text-sm">
        Browse Products
      </Link>
    </div>
  )
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    try {
      const data = await ordersApi.getAll()
      setOrders(data?.orders ?? data ?? [])
    } catch (err) {
      if (err?.status === 401) {
        router.push('/login?redirect=/orders')
      } else {
        toastError('Failed to load orders. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }
    loadOrders()
  }, [user, authLoading, loadOrders])

  return (
    <div className="page-enter min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
          <p className="text-text-secondary text-sm mt-1">
            Track and manage your bookshop orders
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

