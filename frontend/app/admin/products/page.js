'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { adminApi } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatPrice(val) {
  return '₦' + Number(val ?? 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
}

// ── Stock badge ───────────────────────────────────────────────────────────────

function StockBadge({ qty }) {
  if (qty <= 0)  return <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Out of stock</span>
  if (qty <= 5)  return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">Low — {qty} left</span>
  return <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{qty} in stock</span>
}

// ── Edit stock modal ──────────────────────────────────────────────────────────

function EditStockModal({ product, onClose, onSuccess }) {
  const [qty, setQty] = useState(String(product.stock_qty ?? 0))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const parsed = parseInt(qty, 10)
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Enter a valid stock quantity (0 or more).')
      return
    }
    setSaving(true)
    try {
      await adminApi.updateProduct(product.id, { stock_qty: parsed })
      toast.success(`Stock updated to ${parsed}`)
      onSuccess()
      onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Could not update stock. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Update Stock" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border/60">
          {product.image_url ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-xl">📦</div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-text-primary text-sm truncate">{product.name}</p>
            <p className="text-xs text-text-secondary mt-0.5">Current stock: <strong>{product.stock_qty ?? 0}</strong></p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">New Stock Quantity</label>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="input-field text-center text-lg font-bold"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">
            {saving ? <Spinner size="sm" color="white" /> : 'Save Stock'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Edit price modal ──────────────────────────────────────────────────────────

function EditPriceModal({ product, onClose, onSuccess }) {
  const [price, setPrice] = useState(String(product.price ?? 0))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const parsed = parseFloat(price)
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Enter a valid price.')
      return
    }
    setSaving(true)
    try {
      await adminApi.updateProduct(product.id, { price: parsed })
      toast.success(`Price updated to ${formatPrice(parsed)}`)
      onSuccess()
      onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Could not update price. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Update Price" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border/60">
          {product.image_url ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-xl">📦</div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-text-primary text-sm truncate">{product.name}</p>
            <p className="text-xs text-text-secondary mt-0.5">Current price: <strong>{formatPrice(product.price)}</strong></p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">New Price (₦)</label>
          <input
            type="number"
            min="0"
            step="50"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="input-field text-center text-lg font-bold"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">
            {saving ? <Spinner size="sm" color="white" /> : 'Save Price'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({ product, onEditStock, onEditPrice }) {
  return (
    <tr className="border-b border-border hover:bg-gray-50/70 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="40px" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-base">📦</div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate max-w-[180px]">{product.name}</p>
            {product.category?.name && (
              <p className="text-xs text-text-secondary truncate">{product.category.name}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-bold text-primary whitespace-nowrap">
        {formatPrice(product.price)}
      </td>
      <td className="px-4 py-3">
        <StockBadge qty={product.stock_qty ?? 0} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditStock(product)}
            className="text-xs font-semibold text-primary bg-primary-muted border border-primary/20
                       px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
          >
            Edit Stock
          </button>
          <button
            onClick={() => onEditPrice(product)}
            className="text-xs font-semibold text-text-secondary bg-gray-50 border border-border/60
                       px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Edit Price
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [stockTarget, setStockTarget] = useState(null)
  const [priceTarget, setPriceTarget] = useState(null)
  const [filter,      setFilter]      = useState('all') // all | low | out

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getProducts()
      setProducts(data?.products ?? data ?? [])
    } catch (err) {
      if (err?.status === 401) toast.error('Session expired. Please log in again.')
      else toast.error('Could not load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Filter + search
  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'low') return p.stock_qty > 0 && p.stock_qty <= 5
    if (filter === 'out') return !p.stock_qty || p.stock_qty <= 0
    return true
  })

  const outOfStock = products.filter(p => !p.stock_qty || p.stock_qty <= 0).length
  const lowStock   = products.filter(p => p.stock_qty > 0 && p.stock_qty <= 5).length

  return (
    <div className="page-enter px-4 md:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            {outOfStock > 0 && <span className="text-red-600 ml-2">· {outOfStock} out of stock</span>}
            {lowStock > 0 && <span className="text-yellow-600 ml-2">· {lowStock} low</span>}
          </p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="btn-secondary text-sm px-4 py-2 min-h-[40px] gap-1.5"
        >
          {loading ? <Spinner size="sm" /> : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          )}
          Refresh
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input-field flex-1 text-sm"
        />
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'low', label: `Low (${lowStock})` },
            { key: 'out', label: `Out (${outOfStock})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap
                ${filter === f.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-text-secondary border-border/60 hover:border-primary/40 hover:text-primary'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="📦"
          title={search ? 'No products match your search' : 'No products found'}
          description={search ? 'Try a different search term.' : 'Products will appear here once added to the store.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Product', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEditStock={setStockTarget}
                    onEditPrice={setPriceTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/60 text-xs text-text-secondary">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>
      )}

      {/* Modals */}
      {stockTarget && (
        <EditStockModal
          product={stockTarget}
          onClose={() => setStockTarget(null)}
          onSuccess={fetchProducts}
        />
      )}
      {priceTarget && (
        <EditPriceModal
          product={priceTarget}
          onClose={() => setPriceTarget(null)}
          onSuccess={fetchProducts}
        />
      )}

    </div>
  )
}


