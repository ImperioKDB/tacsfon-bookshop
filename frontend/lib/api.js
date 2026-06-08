// lib/api.js
// Single source of truth for all backend API calls.
// All paths are relative to NEXT_PUBLIC_API_URL (Express backend on Render).
// Never use raw fetch in components — always call through this file.

import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// How long to wait for Render before giving up.
// 8 s covers a warm-but-slow response without blocking the UI forever.
// Cold starts are handled by the keep-alive workflow — not by waiting longer here.
const TIMEOUT_MS = 8000

// ── Internal fetch wrapper ────────────────────────────────────────────────────

/**
 * fetchWithTimeout — wraps fetch with an AbortController timeout.
 * Throws a plain Error with message 'TIMEOUT' on expiry so callers
 * can distinguish timeout from server error if needed.
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeout = new Error('TIMEOUT')
      timeout.status = 408
      throw timeout
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v))
  const res = await fetchWithTimeout(url.toString())
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authGet(path, params = {}) {
  const token = await getToken()
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v))
  const res = await fetchWithTimeout(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authPost(path, body) {
  const token = await getToken()
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authPatch(path, body) {
  const token = await getToken()
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authDelete(path) {
  const token = await getToken()
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

// Multipart form upload — no Content-Type header (browser sets it with boundary).
// Uses a longer timeout (30 s) for file uploads.
async function authUploadForm(path, formData) {
  const token = await getToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData,
      signal:  controller.signal,
    })
    if (!res.ok) throw await buildError(res)
    return res.json().then(r => r.data)
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeout = new Error('TIMEOUT')
      timeout.status = 408
      throw timeout
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return session.access_token
}

async function buildError(res) {
  const body = await res.json().catch(() => ({}))
  const err = new Error(body.error?.message || 'Request failed')
  err.status = res.status
  err.code   = body.error?.code || null
  return err
}

// ── API namespaces ────────────────────────────────────────────────────────────

export const productsApi = {
  getAll:  (params) => get('/api/products', params),
  getById: (id)     => get(`/api/products/${id}`),
}

export const categoriesApi = {
  getAll: () => get('/api/categories'),
}

export const cartApi = {
  get:        ()             => authGet('/api/cart'),
  addItem:    (body)         => authPost('/api/cart/items', body),
  updateItem: (itemId, body) => authPatch(`/api/cart/items/${itemId}`, body),
  removeItem: (itemId)       => authDelete(`/api/cart/items/${itemId}`),
  clear:      ()             => authDelete('/api/cart'),
}

export const ordersApi = {
  getAll:       (params) => authGet('/api/orders', params),
  getById:      (id)     => authGet(`/api/orders/${id}`),
  markReceived: (id)     => authPatch(`/api/orders/${id}/received`, {}),
}

export const paymentApi = {
  initiate: (body)   => authPost('/api/payment/initiate', body),
  verify:   (ref_id) => authPost('/api/payment/verify', { ref_id }),
  confirm:  (ref_id) => authPost('/api/payment/admin/confirm', { ref_id }),
}

export const notificationsApi = {
  getAll:      (params) => authGet('/api/notifications', params),
  markRead:    (id)     => authPatch(`/api/notifications/${id}/read`, {}),
  markAllRead: ()       => authPatch('/api/notifications/read-all', {}),
}

export const receiptsApi = {
  getByToken:   (token)   => get(`/api/receipts/share/${token}`),
  getByOrderId: (orderId) => authGet(`/api/receipts/${orderId}`),
}

export const authApi = {
  getMe:  () => authGet('/api/auth/me'),
  logout: () => authPost('/api/auth/logout', {}),
}

export const adminApi = {
  // Orders
  getOrders:     (status) => authGet('/api/admin/orders', status ? { status } : {}),
  getOrderById:  (id)     => authGet(`/api/admin/orders/${id}`),
  dispatchOrder: (id)     => authPatch(`/api/admin/orders/${id}/dispatch`, {}),
  createWalkin:  (body)   => authPost('/api/admin/orders/walkin', body),

  // Products
  getProducts:   (params)       => authGet('/api/products', params),
  createProduct: (body)         => authPost('/api/admin/products', body),
  updateProduct: (id, body)     => authPatch(`/api/admin/products/${id}`, body),
  deleteProduct: (id)           => authDelete(`/api/admin/products/${id}`),
  uploadImage:   (id, formData) => authUploadForm(`/api/admin/products/${id}/image`, formData),

  // Categories
  getCategories:  ()     => get('/api/categories'),
  createCategory: (body) => authPost('/api/admin/categories', body),
  deleteCategory: (id)   => authDelete(`/api/admin/categories/${id}`),

  // Admins
  getAdmins:   ()     => authGet('/api/admin/admins'),
  createAdmin: (body) => authPost('/api/admin/admins', body),
  deleteAdmin: (id)   => authDelete(`/api/admin/admins/${id}`),

  // Logs & dashboard
  getLogs:      (params) => authGet('/api/admin/logs', params),
  getDashboard: ()       => authGet('/api/admin/dashboard'),

  // Receipts
  getReceipts: (params) => authGet('/api/admin/receipts', params),

  // Pending payments
  getPendingPayments: () => authGet('/api/admin/pending-payments'),
}
