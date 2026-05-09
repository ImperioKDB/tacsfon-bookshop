'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatPrice(val) {
  return '₦' + Number(val ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminDispatchedPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const data = await adminApi.getOrders('dispatched')
      setOrders(data.orders ?? data ?? [])
    } catch {
      toast.error('Could not load orders. Please try again.')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dispatched Orders</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} on the way`}
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="btn-secondary text-sm px-4 py-2 min-h-[40px]"
        >
          {refreshing ? <Spinner size="sm" /> : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon="🚚" title="No dispatched orders" description="Orders that have been dispatched will appear here." />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Total', 'Dispatched', 'Phone', 'Address'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">#{order.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{order.customer_name ?? order.profiles?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{formatDate(order.updated_at ?? order.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{order.profiles?.phone ?? order.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary max-w-[160px] truncate">{order.delivery_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

