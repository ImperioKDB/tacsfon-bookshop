'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { supabaseBrowser } from '@/lib/supabase'
import toast from 'react-hot-toast'

function CartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const router = useRouter()
  const { user, role, loading } = useAuth()
  const { cartCount } = useCart()

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      await supabaseBrowser.auth.signOut()
      setMenuOpen(false)
      setProfileOpen(false)
      toast.success('Logged out successfully')
      router.push('/')
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Student'

  const guestLinks = [
    { label: 'Browse', href: '/products' },
    { label: 'About',  href: '/about'    },
    { label: 'Contact', href: '/contact' },
  ]
  const studentLinks = [
    { label: 'Browse', href: '/products' },
    { label: 'Orders', href: '/orders'   },
  ]
  const navLinks = user ? studentLinks : guestLinks

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-primary tracking-tight shrink-0">
          TACSFON Bookshop
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
                  className="text-text-secondary hover:text-primary transition-colors
                             min-h-[44px] flex items-center text-sm font-medium">
              {link.label}
            </Link>
          ))}

          {role === 'admin' && (
            <Link href="/admin"
                  className="text-text-secondary hover:text-primary transition-colors
                             min-h-[44px] flex items-center text-sm font-medium">
              Dashboard
            </Link>
          )}

          {/* Cart */}
          {user && (
            <Link href="/cart"
                  className="relative min-h-[44px] flex items-center gap-1.5
                             text-text-secondary hover:text-primary transition-colors text-sm font-medium">
              <CartIcon size={18} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-3 bg-accent text-white text-xs
                                 w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth area */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(prev => !prev)}
                      className="flex items-center gap-2 min-h-[44px] text-sm font-medium
                                 text-text-secondary hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-light border border-primary/20
                                flex items-center justify-center text-primary font-bold text-xs">
                  {firstName[0].toUpperCase()}
                </div>
                <span>{firstName}</span>
                <svg className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl
                                border border-border shadow-lg py-2 animate-fade-in">
                  <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-text-primary
                                   hover:bg-primary-muted hover:text-primary transition-colors">
                    👤 View Profile
                  </Link>
                  <Link href="/orders" onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-text-primary
                                   hover:bg-primary-muted hover:text-primary transition-colors">
                    📦 My Orders
                  </Link>
                  {role === 'admin' && (
                    <Link href="/admin" onClick={() => setProfileOpen(false)}
                          className="block px-4 py-3 text-sm text-text-primary
                                     hover:bg-primary-muted hover:text-primary transition-colors">
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-accent
                                       hover:bg-red-50 transition-colors">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login"   className="btn-secondary px-5 py-2 text-sm">Login</Link>
              <Link href="/signup"  className="btn-primary  px-5 py-2 text-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link href="/cart"
                  className="relative min-h-[44px] min-w-[44px] flex items-center
                             justify-center text-text-secondary hover:text-primary transition-colors">
              <CartIcon size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-0.5 bg-accent text-white text-xs
                                 w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-primary"
                  aria-label="Toggle menu">
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b
                        border-border shadow-lg p-4 space-y-1 animate-fade-in">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 text-text-primary hover:text-primary
                             hover:bg-primary-muted rounded-xl transition-colors
                             min-h-[44px] flex items-center text-sm font-medium">
              {link.label}
            </Link>
          ))}

          {role === 'admin' && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 text-text-primary hover:text-primary
                             hover:bg-primary-muted rounded-xl transition-colors
                             min-h-[44px] flex items-center text-sm font-medium">
              ⚙️ Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light border border-primary/20
                                  flex items-center justify-center text-primary font-bold text-xs">
                    {firstName[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-text-secondary">Hey, {firstName}!</span>
                </div>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                      className="btn-secondary w-full text-sm">
                  View Profile
                </Link>
                <button onClick={handleLogout}
                        className="w-full min-h-[44px] flex items-center justify-center
                                   rounded-full px-6 py-3 border-2 border-accent text-accent
                                   text-sm font-semibold hover:bg-red-50 transition-all duration-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login"  onClick={() => setMenuOpen(false)} className="btn-secondary w-full text-sm">Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-primary  w-full text-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
            }
