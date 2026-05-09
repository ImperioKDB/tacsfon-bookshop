'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { cartApi } from '@/lib/api'
import { supabaseBrowser } from '@/lib/supabase'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading]     = useState(false)

  // Derived — never stored separately, always in sync with cartItems
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * Number(item.product?.price ?? 0), 0),
    [cartItems]
  )

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const data  = await cartApi.get()
      // Handle both { items: [] } and { cart: { items: [] } } response shapes
      const items = data?.items ?? data?.cart?.items ?? []
      setCartItems(items)
    } catch {
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Auth sync ────────────────────────────────────────────────────────────────
  // Runs on mount: hydrate cart if a session already exists (page refresh, etc.)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchCart()
    })
  }, [fetchCart])

  // Stays in sync with future auth events: login, logout, token refresh, OAuth
  useEffect(() => {
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchCart()
        } else {
          // Logged out — wipe local cart immediately
          setCartItems([])
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchCart])

  // ── Mutations ────────────────────────────────────────────────────────────────

  /**
   * Add a product to the cart.
   * - If the item already exists locally → optimistically increment quantity.
   * - If it's a new item → refetch after server confirms (we don't have full product
   *   data locally to build the cart_item shape ourselves).
   *
   * @param {{ productId: string, quantity?: number }} opts
   */
  async function addToCart({ productId, quantity = 1 }) {
    const prev     = cartItems
    const existing = cartItems.find(i => i.product_id === productId)

    if (existing) {
      // Optimistic update — cap at stock_qty if available
      const maxQty   = existing.product?.stock_qty ?? Infinity
      const newQty   = Math.min(existing.quantity + quantity, maxQty)
      setCartItems(items =>
        items.map(i =>
          i.product_id === productId ? { ...i, quantity: newQty } : i
        )
      )
    }

    try {
      await cartApi.addItem({ product_id: productId, quantity })
      // Always refetch — server enforces stock limits and returns canonical state
      await fetchCart()
    } catch (err) {
      setCartItems(prev) // rollback
      throw err
    }
  }

  /**
   * Change the quantity of an existing cart item.
   * Optimistic — rolls back on failure.
   *
   * @param {string} cartItemId  — cart_items.id (not product_id)
   * @param {number} newQty
   */
  async function updateQuantity(cartItemId, newQty) {
    if (newQty < 1) return
    const prev = cartItems

    setCartItems(items =>
      items.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i)
    )

    try {
      await cartApi.updateItem(cartItemId, { quantity: newQty })
    } catch (err) {
      setCartItems(prev)
      throw err
    }
  }

  /**
   * Remove a single item from the cart.
   * Optimistic — rolls back on failure.
   *
   * @param {string} cartItemId  — cart_items.id
   */
  async function removeFromCart(cartItemId) {
    const prev = cartItems
    setCartItems(items => items.filter(i => i.id !== cartItemId))

    try {
      await cartApi.removeItem(cartItemId)
    } catch (err) {
      setCartItems(prev)
      throw err
    }
  }

  /**
   * Remove all items from the cart.
   * Optimistic — rolls back on failure.
   */
  async function clearCart() {
    const prev = cartItems
    setCartItems([])

    try {
      await cartApi.clear()
    } catch (err) {
      setCartItems(prev)
      throw err
    }
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
