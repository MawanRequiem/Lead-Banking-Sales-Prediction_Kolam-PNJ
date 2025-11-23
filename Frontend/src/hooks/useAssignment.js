import { useState, useEffect } from 'react'
import axios from '@/lib/axios' // Pastikan Anda punya konfigurasi axios instance

export function useAssignments() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      // Panggil endpoint yang baru kita buat
      const response = await axios.get('/sales-operation/assignments')
      setData(response.data.data.data)
    } catch (err) {
      console.error("Gagal mengambil data assignment:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  return { data, loading, error, refetch: fetchAssignments }
}
