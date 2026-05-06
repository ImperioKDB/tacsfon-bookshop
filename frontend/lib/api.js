import { supabaseBrowser } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ── Token helper ────────────────────────────────────────────────────────────

async function getToken() {
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return session.access_token
}

// ── Error builder ────────────────────────────────────────────────────────────

async function buildError(res) {
  let body = {}
  try { body = await res.json() } catch { /* non-JSON response */ }
  const err = new Error(body.message || 'Request failed')
  err.status = res.status
  return err
}

// ── Base fetch helpers ───────────────────────────────────────────────────────

async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw await buildError(res)
  return res.json()
}

async function authGet(path, params = {}) {
  const token = await getToken()
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await buildError(res)
  return res.json()
}

async function authPost(path, body) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await buildError(res)
  return res.json()
}

async function authPatch(path, body = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await buildError(res)
  return res.json()
}

async function authDelete(path) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await buildError(res)
  // Some DELETE endpoints return 204 No Content
  if (res.status === 204) return null
  return res.json()
}

async function authPostFormData(path, formData) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // No Content-Type — browser sets multipart/form-data boundary automatically
    body: formData,
  })
  if (!res.ok) throw await buildError(res)
  return res.json()
}

async function authPatchFormData(path, formData) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw await buildError(res)
  return res.json()
}

// ── API Namespaces ───────────────────────────────────────────────────────────

// Products — public, no auth required
export const productsApi = {
  getAll:      (params)  => get('/api/products', params),
  getById:     (id)      => get(`/api/products/${id}`),
  getFeatured: (limit = 6) => get('/api/products', { featured: true, limit }),
}

// Cart — requires auth
export const cartApi = {
  get:        ()            => authGet('/api/cart'),
  addItem:    (body)        => authPost('/api/cart/items', body),
  updateItem: (id, body)    => authPatch(`/api/cart/items/${id}`, body),
  removeItem: (id)          => authDelete(`/api/cart/items/${id}`),
  clear:      ()            => authDelete('/api/cart'),
}

// Orders — requires auth
export const ordersApi = {
  getAll:       ()   => authGet('/api/orders'),
  getById:      (id) => authGet(`/api/orders/${id}`),
  markReceived: (id) => authPatch(`/api/orders/${id}/received`),
}

// Payment — requires auth
export const paymentApi = {
  initiate: (body) => authPost('/api/payment/initiate', body),
  verify:   (ref)  => authGet('/api/payment/verify', { ref }),
}

// Notifications — requires auth
export const notificationsApi = {
  getAll:     ()   => authGet('/api/notifications'),
  markRead:   (id) => authPatch(`/api/notifications/${id}/read`),
  markAllRead: ()  => authPatch('/api/notifications/read-all'),
}

// Receipts — public (share link, no auth required)
export const receiptsApi = {
  getByToken: (token) => get(`/api/receipts/${token}`),
}

// Admin — requires auth + admin role (enforced server-side too)
export const adminApi = {
  // Orders
  getOrders:     (status)     => authGet('/api/admin/orders', { status }),
  dispatchOrder: (id)         => authPatch(`/api/admin/orders/${id}/dispatch`),
  createWalkin:  (body)       => authPost('/api/admin/orders/walkin', body),

  // Products
  getProducts:   ()           => authGet('/api/admin/products'),
  createProduct: (formData)   => authPostFormData('/api/admin/products', formData),
  updateProduct: (id, formData) => authPatchFormData(`/api/admin/products/${id}`, formData),
  deleteProduct: (id)         => authDelete(`/api/admin/products/${id}`),

  // Categories
  getCategories:  ()     => authGet('/api/admin/categories'),
  createCategory: (body) => authPost('/api/admin/categories', body),
  deleteCategory: (id)   => authDelete(`/api/admin/categories/${id}`),

  // Admins
  getAdmins:    ()     => authGet('/api/admin/admins'),
  createAdmin:  (body) => authPost('/api/admin/admins', body),
  deleteAdmin:  (id)   => authDelete(`/api/admin/admins/${id}`),

  // Logs
  getLogs:     (params) => authGet('/api/admin/logs', params),

  // Receipts
  getReceipts: (params) => authGet('/api/admin/receipts', params),

  // Stats
  getStats:    ()        => authGet('/api/admin/stats'),
}

