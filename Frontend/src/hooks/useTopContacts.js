import { useEffect, useState } from 'react'

// Simple mock data — replace with real fetch in production
const MOCK_TOP5 = [
  { id: 'c-1001', name: 'Andi Wijaya', lastContact: '2025-11-17', score: 92 },
  { id: 'c-1002', name: 'Siti Nur', lastContact: '2025-11-16', score: 76 },
  { id: 'c-1003', name: 'Budi Santoso', lastContact: '2025-11-15', score: 48 },
  { id: 'c-1004', name: 'Dewi Lestari', lastContact: '2025-11-14', score: 64 },
  { id: 'c-1005', name: 'Rizal Hakim', lastContact: '2025-11-13', score: 30 },
]

// Not the real hook
export default function useTopContacts({ count = 5, delay = 450 } = {}) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    setError(null)

    const t = setTimeout(() => {
      if (!mounted) return
      try {
        setData(MOCK_TOP5.slice(0, count))
        setIsLoading(false)
      } catch (err) {
        setError(err)
        setIsLoading(false)
      }
    }, delay)

    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [count, delay])

  return { data, isLoading, error }
}
