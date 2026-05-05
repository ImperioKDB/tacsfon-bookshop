'use client'
import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)

  // Phase 4: sync with backend on login, handle mutations, optimistic updates
  return (
    <CartContext.Provider value={{ cartItems, cartCount, setCartItems, setCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
