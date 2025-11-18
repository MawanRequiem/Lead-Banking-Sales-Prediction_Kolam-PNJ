import { useState, useEffect, useCallback } from 'react'

// dummy dataset used by default
const DUMMY_NOTIFICATIONS = [
  { id: 1, title: 'Penawaran baru: Diskon 20%', time: '2 jam lalu', read: false },
  { id: 2, title: 'Pengingat harian: Cek tugas', time: 'Hari ini', read: false },
  { id: 3, title: 'Ganti password berkala', time: '3 hari lagi', read: true },
]

// useNotifications: dummy implementation (no network). Keeps same API as
// the real hook so UI components don't need changes. To switch to real
// network calls later, replace the internals or add a `useDummy` flag.
export default function useNotifications({ pollInterval = 0, useDummy = true } = {}) {

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Simulated fetch (returns dummy data). Accepts `signal` for API parity.
  const fetchNotifications = useCallback(async (signal) => {
    setLoading(true)
    setError(null)

    try {
      if (useDummy) {
        // simulate network delay
        await new Promise((r) => setTimeout(r, 200))
        setNotifications(DUMMY_NOTIFICATIONS)
      } else {
        // Real fetch placeholder (kept for future):
        const res = await fetch('/api/notifications', { signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Error fetching')
    } finally {
      setLoading(false)
    }
  }, [useDummy])

  useEffect(() => {
    const ctrl = new AbortController()
    fetchNotifications(ctrl.signal)

    let timer
    if (pollInterval > 0) {
      timer = setInterval(() => fetchNotifications(), pollInterval)
    }

    return () => {
      ctrl.abort()
      if (timer) clearInterval(timer)
    }
  }, [fetchNotifications, pollInterval])

  const deleteNotification = useCallback(async (id) => {
    // optimistic update on dummy dataset
    setNotifications((prev) => prev.filter((n) => n.id !== id))

    if (useDummy) return

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        await fetchNotifications()
      }
    } catch {
      await fetchNotifications()
    }
  }, [useDummy, fetchNotifications])

  const markAllRead = useCallback(async () => {
    // optimistic local mark
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    if (useDummy) return

    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      if (!res.ok) {
        await fetchNotifications()
      }
    } catch {
      await fetchNotifications()
    }
  }, [useDummy, fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    deleteNotification,
    markAllRead,
    setNotifications,
  }
}
