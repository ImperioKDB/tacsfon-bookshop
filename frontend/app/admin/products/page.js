'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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

function StockBadge({ qty }) {
  if (qty <= 0)  return <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Out of stock</span>
  if (qty <= 5)  return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">Low — {qty} left</span>
  return <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{qty} in stock</span>
}

// ── Add Product Modal ─────────────────────────────────────────────────────────

function AddProductModal({ categories, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', price: '', stock_qty: '', category_id: '', is_available: true,
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [errors,       setErrors]       = useState({})
  const fileRef = useRef(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG or WebP allowed'); return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())           e.name      = 'Product name is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                     e.price     = 'Valid price required'
    if (!form.stock_qty || isNaN(Number(form.stock_qty)) || Number(form.stock_qty) < 0)
                                     e.stock_qty = 'Valid stock quantity required'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setSaving(true)
    try {
      // Step 1: create product
      const product = await adminApi.createProduct({
        name:         form.name.trim(),
        price:        Number(form.price),
        stock_qty:    Number(form.stock_qty),
        category_id:  form.category_id || undefined,
        is_available: form.is_available,
      })

      // Step 2: upload image if selected
      if (imageFile && product?.id) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await adminApi.uploadImage(product.id, formData)
      }

      toast.success('Product added successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission.")
      else toast.error(err?.message || 'Could not add product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Add New Product" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Product Image <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-36 rounded-2xl border-2 border-dashed border-border/60
                       bg-gray-50 flex flex-col items-center justify-center gap-2
                       cursor-pointer hover:border-primary/40 hover:bg-primary-muted transition-all"
          >
            {imagePreview ? (
              <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-2xl" sizes="100vw" />
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p className="text-xs text-text-secondary">Tap to upload image</p>
                <p className="text-xs text-text-secondary/60">JPEG, PNG, WebP · max 5MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                 className="hidden" onChange={handleImage} />
          {imagePreview && (
            <button onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="text-xs text-accent mt-1.5 hover:underline">
              Remove image
            </button>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Product Name *</label>
          <input className="input-field" value={form.name}
                 onChange={e => set('name', e.target.value)} placeholder="e.g. A4 Exercise Book" />
          {errors.name && <p className="text-xs text-accent mt-1">{errors.name}</p>}
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Price (₦) *</label>
            <input className="input-field" type="number" min="0" step="50"
                   value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 500" />
            {errors.price && <p className="text-xs text-accent mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Stock Qty *</label>
            <input className="input-field" type="number" min="0"
                   value={form.stock_qty} onChange={e => set('stock_qty', e.target.value)} placeholder="e.g. 50" />
            {errors.stock_qty && <p className="text-xs text-accent mt-1">{errors.stock_qty}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
          <select className="input-field" value={form.category_id}
                  onChange={e => set('category_id', e.target.value)}>
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-border/60">
          <div>
            <p className="text-sm font-medium text-text-primary">Available for purchase</p>
            <p className="text-xs text-text-secondary">Students can see and buy this product</p>
          </div>
          <button
            onClick={() => set('is_available', !form.is_available)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              form.is_available ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              form.is_available ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">
            {saving ? <Spinner size="sm" color="white" /> : 'Add Product'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Edit Stock Modal ──────────────────────────────────────────────────────────

function EditStockModal({ product, onClose, onSuccess }) {
  const [qty, setQty] = useState(String(product.stock_qty ?? 0))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const parsed = parseInt(qty, 10)
    if (isNaN(parsed) || parsed < 0) { toast.error('Enter a valid stock quantity (0 or more).'); return }
    setSaving(true)
    try {
      await adminApi.updateProduct(product.id, { stock_qty: parsed })
      toast.success(`Stock updated to ${parsed}`)
      onSuccess(); onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission.")
      else toast.error('Could not update stock. Please try again.')
    } finally { setSaving(false) }
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
            <p className="text-xs text-text-secondary mt-0.5">Current: <strong>{product.stock_qty ?? 0}</strong></p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">New Stock Quantity</label>
          <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)}
                 className="input-field text-center text-lg font-bold" autoFocus />
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

// ── Edit Price Modal ──────────────────────────────────────────────────────────

function EditPriceModal({ product, onClose, onSuccess }) {
  const [price, setPrice] = useState(String(product.price ?? 0))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const parsed = parseFloat(price)
    if (isNaN(parsed) || parsed < 0) { toast.error('Enter a valid price.'); return }
    setSaving(true)
    try {
      await adminApi.updateProduct(product.id, { price: parsed })
      toast.success(`Price updated to ${formatPrice(parsed)}`)
      onSuccess(); onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission.")
      else toast.error('Could not update price. Please try again.')
    } finally { setSaving(false) }
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
            <p className="text-xs text-text-secondary mt-0.5">Current: <strong>{formatPrice(product.price)}</strong></p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">New Price (₦)</label>
          <input type="number" min="0" step="50" value={price} onChange={e => setPrice(e.target.value)}
                 className="input-field text-center text-lg font-bold" autoFocus />
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

// ── Upload Image Modal ────────────────────────────────────────────────────────

function UploadImageModal({ product, onClose, onSuccess }) {
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(product.image_url || null)
  const [saving,       setSaving]       = useState(false)
  const fileRef = useRef(null)

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG or WebP allowed'); return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!imageFile) { toast.error('Please select an image first'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      await adminApi.uploadImage(product.id, formData)
      toast.success('Image updated!')
      onSuccess(); onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission.")
      else toast.error('Could not upload image. Please try again.')
    } finally { setSaving(false) }
  }

  return (
    <Modal title="Update Product Image" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{product.name}</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-40 rounded-2xl border-2 border-dashed border-border/60
                     bg-gray-50 flex flex-col items-center justify-center gap-2
                     cursor-pointer hover:border-primary/40 hover:bg-primary-muted transition-all overflow-hidden"
        >
          {imagePreview ? (
            <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="100vw" />
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <p className="text-xs text-text-secondary">Tap to select image</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
               className="hidden" onChange={handleImage} />
        <div className="flex gap-3">
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving || !imageFile} className="btn-primary flex-1 text-sm">
            {saving ? <Spinner size="sm" color="white" /> : 'Upload Image'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Delete Product Modal ──────────────────────────────────────────────────────

function DeleteProductModal({ product, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await adminApi.deleteProduct(product.id)
      toast.success('Product deleted.')
      onSuccess(); onClose()
    } catch (err) {
      if (err?.status === 403) toast.error("You don't have permission.")
      else toast.error('Could not delete product.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Delete Product" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Delete <span className="font-semibold text-text-primary">"{product.name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleDelete} disabled={loading}
                  className="flex-1 bg-accent text-white rounded-full px-6 py-3 font-semibold text-sm
                             hover:bg-red-700 disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Product Row ───────────────────────────────────────────────────────────────

function ProductRow({ product, onEditStock, onEditPrice, onUploadImage, onDelete }) {
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
            <p className="text-sm font-semibold text-text-primary truncate max-w-[160px]">{product.name}</p>
            {product.category?.name && (
              <p className="text-xs text-text-secondary truncate">{product.category.name}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-bold text-primary whitespace-nowrap">{formatPrice(product.price)}</td>
      <td className="px-4 py-3"><StockBadge qty={product.stock_qty ?? 0} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => onEditStock(product)}
                  className="text-xs font-semibold text-primary bg-primary-muted border border-primary/20
                             px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap">
            Stock
          </button>
          <button onClick={() => onEditPrice(product)}
                  className="text-xs font-semibold text-text-secondary bg-gray-50 border border-border/60
                             px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            Price
          </button>
          <button onClick={() => onUploadImage(product)}
                  className="text-xs font-semibold text-text-secondary bg-gray-50 border border-border/60
                             px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            Image
          </button>
          <button onClick={() => onDelete(product)}
                  className="text-xs font-semibold text-accent bg-red-50 border border-red-200
                             px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,     setProducts]     = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [showAdd,      setShowAdd]      = useState(false)
  const [stockTarget,  setStockTarget]  = useState(null)
  const [priceTarget,  setPriceTarget]  = useState(null)
  const [imageTarget,  setImageTarget]  = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [prodData, catData] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ])
      setProducts(prodData?.products ?? prodData ?? [])
      setCategories(catData?.categories ?? catData ?? [])
    } catch (err) {
      if (err?.status === 401) toast.error('Session expired. Please log in again.')
      else toast.error('Could not load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

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
            {lowStock   > 0 && <span className="text-yellow-600 ml-2">· {lowStock} low</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2 min-h-[40px]">
            + Add Product
          </button>
          <button onClick={fetchProducts} disabled={loading} className="btn-secondary text-sm px-4 py-2 min-h-[40px]">
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Search products…" className="input-field flex-1 text-sm" />
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'low', label: `Low (${lowStock})` },
            { key: 'out', label: `Out (${outOfStock})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap
                      ${filter === f.key
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-text-secondary border-border/60 hover:border-primary/40 hover:text-primary'}`}>
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
          title={search ? 'No products match your search' : 'No products yet'}
          description={search ? 'Try a different search term.' : 'Click "+ Add Product" to add your first product.'}
          action={!search ? { label: 'Add Product', onClick: () => setShowAdd(true) } : undefined}
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
                  <ProductRow key={p.id} product={p}
                    onEditStock={setStockTarget}
                    onEditPrice={setPriceTarget}
                    onUploadImage={setImageTarget}
                    onDelete={setDeleteTarget}
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

      {showAdd      && <AddProductModal categories={categories} onClose={() => setShowAdd(null)}      onSuccess={fetchProducts} />}
      {stockTarget  && <EditStockModal  product={stockTarget}   onClose={() => setStockTarget(null)}  onSuccess={fetchProducts} />}
      {priceTarget  && <EditPriceModal  product={priceTarget}   onClose={() => setPriceTarget(null)}  onSuccess={fetchProducts} />}
      {imageTarget  && <UploadImageModal product={imageTarget}  onClose={() => setImageTarget(null)}  onSuccess={fetchProducts} />}
      {deleteTarget && <DeleteProductModal product={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={fetchProducts} />}
    </div>
  )
}

