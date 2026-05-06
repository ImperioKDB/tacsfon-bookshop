'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const POLL_INTERVAL_MS = 30_000 // 30 seconds

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const data = await notificationsApi.getAll()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch {
      // Silently fail — don't show error toasts for background polling
    }
  }, [user])

  // Initial fetch + polling
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setLoading(true)
    fetchNotifications().finally(() => setLoading(false))

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [user, fetchNotifications])

  async function markRead(id) {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await notificationsApi.markRead(id)
    } catch {
      // Revert on failure
      fetchNotifications()
    }
  }

  async function markAllRead() {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await notificationsApi.markAllRead()
    } catch {
      fetchNotifications()
    }
  }

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh: fetchNotifications }
}

