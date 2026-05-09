'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CreateAdminModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.full_name.trim() || form.full_name.trim().length < 2) e.full_name = 'Full name required (min 2 chars)'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    try {
      await adminApi.createAdmin({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      toast.success('Admin account created.')
      onSuccess()
      onClose()
    } catch (err) {
      if (err.status === 403) toast.error("You don't have permission to do that.")
      else if (err.status === 409) toast.error('An account with this email already exists.')
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Create Admin Account" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
          <input className="input-field" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Admin full name" />
          {errors.full_name && <p className="text-xs text-accent mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
          <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@example.com" />
          {errors.email && <p className="text-xs text-accent mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Password *</label>
          <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
          {errors.password && <p className="text-xs text-accent mt-1">{errors.password}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={submitting}>Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <><Spinner size="sm" /> Creating…</> : 'Create Admin'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function DeleteAdminModal({ admin, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await adminApi.deleteAdmin(admin.id)
      toast.success('Admin account deleted.')
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
    <Modal title="Delete Admin" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Remove <span className="font-semibold text-text-primary">{admin.full_name}</span> ({admin.email}) as an admin?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 bg-accent text-white rounded-full px-6 py-3 font-semibold
                       transition-all duration-200 hover:bg-red-700 disabled:opacity-50
                       min-h-[44px] flex items-center justify-center gap-2 text-sm">
            {loading ? <><Spinner size="sm" /> Deleting…</> : 'Remove Admin'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminAdminsPage() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getAdmins()
      setAdmins(data.admins ?? data ?? [])
    } catch {
      toast.error('Could not load admins.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Admins</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${admins.length} admin account${admins.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-4 py-2 min-h-[40px]">
          + Create Admin
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : admins.length === 0 ? (
        <EmptyState icon="👤" title="No admins found" description="Create the first admin account above." />
      ) : (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm divide-y divide-border">
          {admins.map(admin => {
            const isSelf = admin.id === user?.id || admin.email === user?.email
            return (
              <div key={admin.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {admin.full_name?.[0]?.toUpperCase() ?? 'A'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm flex items-center gap-2">
                    {admin.full_name ?? '—'}
                    {isSelf && (
                      <span className="text-[10px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{admin.email}</p>
                </div>

                {/* Date */}
                <p className="text-xs text-text-secondary shrink-0 hidden sm:block">
                  {admin.created_at ? formatDate(admin.created_at) : '—'}
                </p>

                {/* Delete */}
                <div className="relative group shrink-0">
                  <button
                    onClick={() => !isSelf && setDeleteTarget(admin)}
                    disabled={isSelf}
                    aria-label={isSelf ? 'Cannot delete own account' : `Delete ${admin.full_name}`}
                    className={`
                      p-2 rounded-xl transition-all duration-150
                      ${isSelf
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-text-secondary hover:text-accent hover:bg-red-50'
                      }
                    `}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                  {isSelf && (
                    <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block z-10
                                    bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      You cannot delete your own account
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateAdminModal onClose={() => setShowCreate(false)} onSuccess={fetchAdmins} />
      )}

      {deleteTarget && (
        <DeleteAdminModal
          admin={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={fetchAdmins}
        />
      )}
    </div>
  )
}

