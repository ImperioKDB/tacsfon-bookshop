'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api/fetch';
import { formatPrice } from '@/lib/utils/formatters';
import { Trash2, Plus, Minus, Loader2, ShoppingBag, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const router  = useRouter();
  const [cart,         setCart]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(false);
  const [removingId,   setRemovingId]   = useState(null);   // item being removed
  const [updatingId,   setUpdatingId]   = useState(null);   // item qty being changed
  const [clearing,     setClearing]     = useState(false);
  const [checkingOut,  setCheckingOut]  = useState(false);
  const abortRef = useRef(null);

  const fetchCart = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Timeout: show error after 8 s instead of spinning forever
    const timeout = setTimeout(() => controller.abort(), 8000);

    setLoading(true);
    setFetchError(false);

    try {
      const data = await apiFetch('/cart', { signal: controller.signal });
      setCart(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setFetchError(true);
        toast.error('Cart took too long to load. Tap retry.');
      } else if (err instanceof ApiError) {
        setFetchError(true);
        toast.error(err.message || 'Failed to load cart.');
      } else {
        setFetchError(true);
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCart();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchCart]);

  // Refetch when tab/screen becomes visible again (fixes blank-on-wake)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchCart();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchCart]);

  const handleRemove = async (itemId) => {
    setRemovingId(itemId);
    try {
      await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(i => i.id !== itemId),
      }));
      toast.success('Item removed.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove item.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleQty = async (itemId, delta, currentQty) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return handleRemove(itemId);

    setUpdatingId(itemId);
    try {
      await apiFetch(`/cart/items/${itemId}`, {
        method: 'PATCH',
        body:   JSON.stringify({ quantity: newQty }),
      });
      setCart(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.id === itemId ? { ...i, quantity: newQty } : i
        ),
      }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await apiFetch('/cart', { method: 'DELETE' });
      setCart(prev => ({ ...prev, items: [] }));
      toast.success('Cart cleared.');
    } catch (err) {
      toast.error('Could not clear cart.');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      router.push('/checkout');
    } catch {
      setCheckingOut(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{
        minHeight:      '60vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '12px',
      }}>
        <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Loading your cart…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Fetch error state ── */
  if (fetchError) {
    return (
      <div style={{
        minHeight:      '60vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '16px',
        padding:        '24px',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Could not load your cart. Please check your connection.
        </p>
        <button
          onClick={fetchCart}
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '7px',
            padding:       '10px 20px',
            fontFamily:    'var(--font-body)',
            fontSize:      '12px',
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         'var(--bg-base)',
            background:    'var(--accent)',
            border:        'none',
            cursor:        'pointer',
          }}
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div style={{
        minHeight:      '60vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '16px',
        padding:        '24px',
      }}>
        <ShoppingBag size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
          Your cart is empty.
        </p>
        <button
          onClick={() => router.push('/browse')}
          style={{
            padding:       '10px 24px',
            fontFamily:    'var(--font-body)',
            fontSize:      '12px',
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         'var(--bg-base)',
            background:    'var(--accent)',
            border:        'none',
            cursor:        'pointer',
          }}
        >
          Browse Books
        </button>
      </div>
    );
  }

  /* ── Cart items ── */
  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: '680px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{
          margin:        0,
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(22px, 5vw, 32px)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color:         'var(--text-primary)',
        }}>
          YOUR CART
        </h1>
        <button
          onClick={handleClear}
          disabled={clearing}
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '5px',
            padding:       '6px 12px',
            fontFamily:    'var(--font-body)',
            fontSize:      '10px',
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         clearing ? 'var(--text-muted)' : 'var(--danger)',
            background:    'transparent',
            border:        `1px solid ${clearing ? 'var(--border)' : 'rgba(224,82,82,0.3)'}`,
            cursor:        clearing ? 'not-allowed' : 'pointer',
            opacity:       clearing ? 0.5 : 1,
            transition:    'all 150ms',
          }}
        >
          {clearing
            ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Trash2 size={11} />
          }
          {clearing ? 'Clearing…' : 'Clear All'}
        </button>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {items.map(item => {
          const isRemoving = removingId === item.id;
          const isUpdating = updatingId === item.id;
          const isBusy     = isRemoving || isUpdating;
          return (
            <div
              key={item.id}
              style={{
                display:         'flex',
                gap:             '14px',
                padding:         '14px',
                background:      'var(--bg-surface)',
                border:          '1px solid var(--border)',
                opacity:         isBusy ? 0.6 : 1,
                transition:      'opacity 150ms',
                pointerEvents:   isBusy ? 'none' : 'auto',
              }}
            >
              {/* Product image */}
              {item.product?.image_url && (
                <img
                  src={item.product.image_url}
                  alt={item.product?.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
                />
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin:      '0 0 4px',
                  fontFamily:  'var(--font-body)',
                  fontSize:    '13px',
                  fontWeight:  600,
                  color:       'var(--text-primary)',
                  overflow:    'hidden',
                  textOverflow:'ellipsis',
                  whiteSpace:  'nowrap',
                }}>
                  {item.product?.name ?? 'Unknown'}
                </p>
                <p style={{
                  margin:     0,
                  fontFamily: 'var(--font-body)',
                  fontSize:   '13px',
                  fontWeight: 700,
                  color:      'var(--accent)',
                }}>
                  {formatPrice(item.unit_price * item.quantity)}
                </p>
              </div>

              {/* Qty controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleQty(item.id, -1, item.quantity)}
                  disabled={isBusy}
                  style={qtyBtnStyle(isBusy)}
                >
                  {isUpdating && item.quantity > 1
                    ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Minus size={11} />
                  }
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', minWidth: '18px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQty(item.id, +1, item.quantity)}
                  disabled={isBusy}
                  style={qtyBtnStyle(isBusy)}
                >
                  {isUpdating
                    ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Plus size={11} />
                  }
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isBusy}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    width:          '28px',
                    height:         '28px',
                    background:     'transparent',
                    border:         '1px solid rgba(224,82,82,0.25)',
                    color:          isRemoving ? 'var(--text-muted)' : 'var(--danger)',
                    cursor:         isBusy ? 'not-allowed' : 'pointer',
                    transition:     'all 150ms',
                  }}
                >
                  {isRemoving
                    ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Trash2 size={11} />
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary + checkout */}
      <div style={{
        padding:      '20px',
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
            Total ({items.length} item{items.length !== 1 ? 's' : ''})
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut || items.length === 0}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '8px',
            width:          '100%',
            padding:        '14px',
            fontFamily:     'var(--font-body)',
            fontSize:       '13px',
            fontWeight:     700,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            color:          checkingOut ? 'var(--text-muted)' : 'var(--bg-base)',
            background:     checkingOut ? 'var(--bg-elevated)' : 'var(--accent)',
            border:         'none',
            cursor:         checkingOut ? 'not-allowed' : 'pointer',
            transition:     'all 150ms',
          }}
        >
          {checkingOut
            ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing…</>
            : 'Proceed to Checkout →'
          }
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function qtyBtnStyle(disabled) {
  return {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '28px',
    height:         '28px',
    background:     'var(--bg-elevated)',
    border:         '1px solid var(--border)',
    color:          disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    transition:     'all 150ms',
  };
}
