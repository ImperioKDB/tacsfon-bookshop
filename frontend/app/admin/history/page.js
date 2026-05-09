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
  return new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const data = await adminApi.getOrders('all')
      setOrders(data.orders ?? data ?? [])
    } catch { toast.error('Could not load orders.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Order History</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => fetchOrders(true)} disabled={refreshing} className="btn-secondary text-sm px-4 py-2 min-h-[40px]">
          {refreshing ? <Spinner size="sm" /> : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon="📚" title="No order history" description="All historical orders will appear here." />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date', 'Phone', 'Ref ID'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">#{o.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{o.customer_name ?? o.profiles?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        o.status === 'received' ? 'bg-green-100 text-green-700' :
                        o.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{o.status ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{o.profiles?.phone ?? o.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">{o.ref_id ?? '—'}</td>
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

