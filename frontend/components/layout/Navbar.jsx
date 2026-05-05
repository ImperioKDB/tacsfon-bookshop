'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const { cartCount } = useCart()

  const navLinks = user
    ? [{ label: 'Browse', href: '/products' }, { label: 'Orders', href: '/orders' }]
    : [{ label: 'Browse', href: '/products' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary tracking-tight">
          TACSFON Bookshop
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-text-secondary hover:text-primary transition-colors min-h-[44px] flex items-center">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="relative min-h-[44px] flex items-center text-text-secondary hover:text-primary transition-colors">
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <span className="text-sm text-text-secondary">Hello, Student 👋</span>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="btn-secondary px-4 py-2">Login</Link>
              <Link href="/signup" className="btn-primary px-4 py-2">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-primary"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-border p-4 space-y-4 animate-fade-in">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-3 text-text-primary min-h-[44px] flex items-center">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="block py-3 text-text-primary min-h-[44px] flex items-center">
            🛒 Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          <div className="pt-2 border-t border-border flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/profile" className="btn-secondary w-full">View Profile</Link>
                <button className="btn-secondary w-full text-accent border-accent">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary w-full">Login</Link>
                <Link href="/signup" className="btn-primary w-full">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
