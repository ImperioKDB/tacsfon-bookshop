// lib/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all backend API calls.
// All paths are relative to NEXT_PUBLIC_API_URL (the Express backend on Render).
// Never use raw fetch in components — always call through this file.
// ─────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ── Internal HTTP helpers ────────────────────────────────────────────────────

async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authGet(path, params = {}) {
  const token = await getToken()
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authPost(path, body) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authPatch(path, body) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

async function authDelete(path) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
}

// Multipart form upload — no Content-Type header (browser sets it with boundary)
async function authUploadForm(path, formData) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw await buildError(res)
  return res.json().then(r => r.data)
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
  err.code = body.error?.code || null
  // Attach payment-specific amounts for INCOMPLETE_PAYMENT (402) handling
  if (body.data?.paid_amount !== undefined) {
    err.paid_amount = body.data.paid_amount
    err.expected_amount = body.data.expected_amount
  }
  return err
}

// ── API namespaces ───────────────────────────────────────────────────────────

// Public product catalog
// Backend: GET /api/products, GET /api/products/:id
// Supported params: page, limit, category_id, search
// NOTE: `featured` param is NOT supported by backend — use `limit: 6` for homepage
export const productsApi = {
  getAll:  (params) => get('/api/products', params),
  getById: (id)     => get(`/api/products/${id}`),
}

// Public categories — no auth required
// Backend: GET /api/categories
export const categoriesApi = {
  getAll: () => get('/api/categories'),
}

// Cart — all routes require auth
// Backend: GET /api/cart, POST /api/cart/items,
//          PATCH /api/cart/items/:itemId, DELETE /api/cart/items/:itemId, DELETE /api/cart
export const cartApi = {
  get:        ()              => authGet('/api/cart'),
  addItem:    (body)          => authPost('/api/cart/items', body),
  // body: { quantity: number }
  updateItem: (itemId, body)  => authPatch(`/api/cart/items/${itemId}`, body),
  removeItem: (itemId)        => authDelete(`/api/cart/items/${itemId}`),
  clear:      ()              => authDelete('/api/cart'),
}

// Orders — student-facing
// Backend: GET /api/orders, GET /api/orders/:id, PATCH /api/orders/:id/received
export const ordersApi = {
  getAll:       (params) => authGet('/api/orders', params),
  getById:      (id)     => authGet(`/api/orders/${id}`),
  markReceived: (id)     => authPatch(`/api/orders/${id}/received`, {}),
}

// Payment
// ⚠️ FIXED vs original spec:
//   - initiate: backend ignores body, derives everything from JWT — send empty object
//   - verify:   backend uses POST (not GET), reads ref_id from req.body (not query string)
// Backend: POST /api/payment/initiate, POST /api/payment/verify
//
// verify success response: { order_id, ref_id, share_token }
// verify pending response: { status: 'pending', ref_id }  ← not an error, keep polling
// verify 402 error: err.paid_amount + err.expected_amount available on the thrown error
export const paymentApi = {
  initiate: ()        => authPost('/api/payment/initiate', {}),
  verify:   (ref_id)  => authPost('/api/payment/verify', { ref_id }),
}

// Notifications — all require auth
// Backend: GET /api/notifications, PATCH /api/notifications/:id/read,
//          PATCH /api/notifications/read-all
export const notificationsApi = {
  getAll:      (params) => authGet('/api/notifications', params),
  markRead:    (id)     => authPatch(`/api/notifications/${id}/read`, {}),
  markAllRead: ()       => authPatch('/api/notifications/read-all', {}),
}

// Receipts
// ⚠️ FIXED vs original spec:
//   - getByToken path is /share/:token, not /:token directly
//   - getByOrderId was missing — needed by /orders/[id] page
// Backend: GET /api/receipts/share/:token (public), GET /api/receipts/:orderId (auth)
export const receiptsApi = {
  getByToken:   (token)   => get(`/api/receipts/share/${token}`),
  getByOrderId: (orderId) => authGet(`/api/receipts/${orderId}`),
}

// Auth — profile
// Backend: GET /api/auth/me, POST /api/auth/logout
export const authApi = {
  getMe:  () => authGet('/api/auth/me'),
  logout: () => authPost('/api/auth/logout', {}),
}

// Admin
// ⚠️ FIXED vs original spec:
//   - getProducts: no GET /api/admin/products exists — use public /api/products
//   - getCategories: no GET /api/admin/categories exists — use public /api/categories
//   - uploadImage: added (was missing from spec) — uses multipart/form-data
// Backend: all /api/admin/* routes require auth + admin role
export const adminApi = {
  // Orders
  getOrders:     (status) => authGet('/api/admin/orders', status ? { status } : {}),
  getOrderById:  (id)     => authGet(`/api/admin/orders/${id}`),
  dispatchOrder: (id)     => authPatch(`/api/admin/orders/${id}/dispatch`, {}),
  createWalkin:  (body)   => authPost('/api/admin/orders/walkin', body),
  // body: { customer_name, phone, notes, items: [{ product_id, quantity }] }

  // Products — uses public route for reads, admin routes for writes
  getProducts:   (params) => authGet('/api/products', params),
  createProduct: (body)   => authPost('/api/admin/products', body),
  // body: { name, price, stock_qty, category_id, is_available?, image_url? }
  updateProduct: (id, body)  => authPatch(`/api/admin/products/${id}`, body),
  deleteProduct: (id)        => authDelete(`/api/admin/products/${id}`),
  uploadImage:   (id, formData) => authUploadForm(`/api/admin/products/${id}/image`, formData),
  // formData: FormData with field name 'image', max 5MB, jpeg/png/webp only

  // Categories — uses public route for reads
  getCategories:  ()     => get('/api/categories'),
  createCategory: (body) => authPost('/api/admin/categories', body),
  // body: { name, description? }
  deleteCategory: (id)   => authDelete(`/api/admin/categories/${id}`),

  // Admins
  getAdmins:   ()     => authGet('/api/admin/admins'),
  createAdmin: (body) => authPost('/api/admin/admins', body),
  // body: { email, password, full_name? }  — NOTE: full_name is a known backend gap
  deleteAdmin: (id)   => authDelete(`/api/admin/admins/${id}`),

  // Logs & dashboard
  getLogs:      (params) => authGet('/api/admin/logs', params),
  // params: { page?, limit?, action? }
  getDashboard: ()       => authGet('/api/admin/dashboard'),

  // Receipts
  getReceipts: (params) => authGet('/api/admin/receipts', params),
}

