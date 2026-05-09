'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function DeleteCategoryModal({ category, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await adminApi.deleteCategory(category.id)
      toast.success('Category deleted.')
      onSuccess()
      onClose()
    } catch (err) {
      if (err.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Delete Category" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Delete <span className="font-semibold text-text-primary">"{category.name}"</span>?
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          ⚠️ Products in this category will become uncategorised.
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getCategories()
      setCategories(data.categories ?? data ?? [])
    } catch {
      toast.error('Could not load categories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return toast.error('Category name cannot be empty.')
    setAdding(true)
    try {
      await adminApi.createCategory({ name })
      toast.success('Category added.')
      setNewName('')
      fetchCategories()
    } catch (err) {
      if (err.status === 403) toast.error("You don't have permission to do that.")
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Categories</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {loading ? '…' : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
        </p>
      </div>

      {/* Add category */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4 mb-5">
        <p className="text-sm font-medium text-text-primary mb-3">Add New Category</p>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Category name…"
            disabled={adding}
          />
          <button onClick={handleAdd} disabled={adding || !newName.trim()} className="btn-primary px-5 min-h-[44px] text-sm">
            {adding ? <Spinner size="sm" /> : 'Add'}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : categories.length === 0 ? (
        <EmptyState icon="🗂️" title="No categories yet" description="Add a category above to get started." />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm divide-y divide-border">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-text-primary text-sm">{cat.name}</p>
                {cat.product_count !== undefined && (
                  <p className="text-xs text-text-secondary">{cat.product_count} product{cat.product_count !== 1 ? 's' : ''}</p>
                )}
              </div>
              <button
                onClick={() => setDeleteTarget(cat)}
                className="p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-red-50 transition-all duration-150"
                aria-label={`Delete ${cat.name}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteCategoryModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={fetchCategories}
        />
      )}
    </div>
  )
}

