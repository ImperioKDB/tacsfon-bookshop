'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { adminApi } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatPrice(val) {
  return '₦' + Number(val ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

// ── Product Form (shared by Create + Edit modals) ─────────────────────────────

function ProductForm({ initial = {}, categories = [], onSubmit, onClose, submitting, title }) {
  const [form, setForm] = useState({
    name:         initial.name         ?? '',
    description:  initial.description  ?? '',
    price:        initial.price        ?? '',
    stock_qty:    initial.stock_qty    ?? '',
    category_id:  initial.category_id  ?? '',
    is_available: initial.is_available ?? true,
  })
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef(null)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function validate() {
    if (!form.name.trim())            { toast.error('Product name is required.');    return false }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                      { toast.error('Valid price is required.');     return false }
    if (!form.stock_qty || isNaN(Number(form.stock_qty)) || Number(form.stock_qty) < 0)
                                      { toast.error('Valid stock quantity required.'); return false }
    return true
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit({
      formData: {
        name:         form.name.trim(),
        description:  form.description.trim(),
        price:        Number(form.price),
        stock_qty:    Number(form.stock_qty),
        category_id:  form.category_id || undefined,
        is_available: form.is_available,
      },
      imageFile,
    })
  }

  return (
    <Modal title={title} onClose={onClose} size="lg">
      <div className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
            <input className="input-field" value={form.name}
                   onChange={e => set('name', e.target.value)} placeholder="e.g. Engineering Mathematics" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Price (₦) *</label>
            <input className="input-field" type="number" min="0" step="0.01"
                   value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Stock Qty *</label>
            <input className="input-field" type="number" min="0"
                   value={form.stock_qty} onChange={e => set('stock_qty', e.target.value)} placeholder="0" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
            <select className="input-field" value={form.category_id}
                    onChange={e => set('category_id', e.target.value)}>
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea className="input-field resize-none min-h-[80px]"
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Brief description of the product…" />
          </div>

          {/* Image upload */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Product Image {initial.id ? '(optional — replaces current)' : '(optional)'}
            </label>
            <input type="file" accept="image/*" ref={fileRef} className="hidden"
                   onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => fileRef.current?.click()}
                    className="btn-secondary text-sm px-4 py-2 min-h-[40px]">
              {imageFile ? `📷 ${imageFile.name}` : '📷 Choose Image'}
            </button>
          </div>

          {/* Availability toggle */}
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('is_available', !form.is_available)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${form.is_available ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
                               ${form.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-text-primary">
              {form.is_available ? 'Available for purchase' : 'Hidden from store'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={submitting}>Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <><Spinner size="sm" /> Saving…</> : 'Save Product'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Delete Modal ───────────────────────────────────────────────────────────────

function DeleteProductModal({ product, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await adminApi.deleteProduct(product.id)
      toast.success('Product deleted.')
      onSuccess()
      onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Delete Product" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Delete <span className="font-semibold text-text-primary">"{product.name}"</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button onClick={handleDelete} disabled={loading}
                  className="flex-1 bg-accent text-white rounded-full px-6 py-3 font-semibold
                             transition-all duration-200 hover:bg-red-700 disabled:opacity-50
                             min-h-[44px] flex items-center justify-center gap-2 text-sm">
            {loading ? <><Spinner size="sm" /> Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,     setProducts]     = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [submitting,   setSubmitting]   = useState(false)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [pData, cData] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ])
      setProducts(pData?.products ?? pData ?? [])
      setCategories(cData?.categories ?? cData ?? [])
    } catch {
      toast.error('Could not load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function handleCreate({ formData, imageFile }) {
    setSubmitting(true)
    try {
      const created = await adminApi.createProduct(formData)
      const productId = created?.product?.id ?? created?.id

      if (imageFile && productId) {
        const fd = new FormData()
        fd.append('image', imageFile)
        await adminApi.uploadImage(productId, fd).catch(() => {})
      }

      toast.success('Product created!')
      setShowCreate(false)
      fetchProducts()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit({ formData, imageFile }) {
    setSubmitting(true)
    try {
      await adminApi.updateProduct(editTarget.id, formData)

      if (imageFile) {
        const fd = new FormData()
        fd.append('image', imageFile)
        await adminApi.uploadImage(editTarget.id, fd).catch(() => {})
      }

      toast.success('Product updated!')
      setEditTarget(null)
      fetchProducts()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-4 py-2 min-h-[40px]">
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No products yet" description="Add your first product above." />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name}
                               className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-lg">
                            📦
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary line-clamp-1">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {product.categories?.name ?? product.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      <span className={product.stock_qty === 0 ? 'text-accent font-semibold' : ''}>
                        {product.stock_qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                                        ${product.is_available
                                          ? 'bg-green-50 text-green-700'
                                          : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_available ? '✅ Available' : '🚫 Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditTarget(product)}
                          className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-muted transition-all"
                          aria-label="Edit product"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-red-50 transition-all"
                          aria-label="Delete product"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <ProductForm
          title="Add Product"
          categories={categories}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
          submitting={submitting}
        />
      )}

      {editTarget && (
        <ProductForm
          title="Edit Product"
          initial={editTarget}
          categories={categories}
          onSubmit={handleEdit}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
        />
      )}

      {deleteTarget && (
        <DeleteProductModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  )
}
