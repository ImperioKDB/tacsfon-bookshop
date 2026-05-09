'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useNotifications } from '@/hooks/useNotifications'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)   return 'just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

function notificationIcon(type) {
  const icons = {
    order_placed:     '🛒',
    order_dispatched: '🚚',
    order_received:   '✅',
    payment_confirmed:'💳',
    promo:            '🎉',
  }
  return icons[type] ?? '🔔'
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref  = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleMarkRead(notification) {
    if (!notification.is_read) markRead(notification.id)
    // If it has a link, navigation handles itself
  }

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-light
                   transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white
                           text-[10px] font-bold rounded-full flex items-center justify-center px-1
                           animate-bounce-once">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border/60
                        z-50 overflow-hidden animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text-primary text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-primary-light text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary font-semibold hover:underline underline-offset-2"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <span className="text-3xl mb-2">🔔</span>
                <p className="text-sm font-medium text-text-primary">All caught up!</p>
                <p className="text-xs text-text-secondary mt-1">No notifications yet.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`flex gap-3 px-4 py-3 border-b border-border/40 last:border-0 cursor-pointer
                              transition-colors duration-150
                              ${n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-primary-muted hover:bg-primary-light/50'}`}
                >
                  {/* Icon */}
                  <span className="text-xl shrink-0 mt-0.5">{notificationIcon(n.type)}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.is_read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-secondary">{timeAgo(n.created_at)}</span>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-border/60 text-center">
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="text-xs text-primary font-semibold hover:underline underline-offset-2"
              >
                View all orders →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

