import { useState, useEffect } from 'react'

// Dummy data moved here so table definitions remain clean.
export const mockData = [
  { id: '1', nama: 'Budi Santoso', pekerjaan: 'Developer', nomorTelepon: '081234567890', jenisKelamin: 'Pria', umur: 28, statusPernikahan: 'Lajang' },
  { id: '2', nama: 'Siti Aisyah', pekerjaan: 'Designer', nomorTelepon: '081112233445', jenisKelamin: 'Wanita', umur: 35, statusPernikahan: 'Menikah' },
  { id: '3', nama: 'Joko Prabowo', pekerjaan: 'Manager', nomorTelepon: '085678901234', jenisKelamin: 'Pria', umur: 45, statusPernikahan: 'Menikah' },
  { id: '4', nama: 'Ayu Lestari', pekerjaan: 'Akuntan', nomorTelepon: '087776655443', jenisKelamin: 'Wanita', umur: 22, statusPernikahan: 'Lajang' },
  { id: '5', nama: 'Rian Hidayat', pekerjaan: 'Marketing', nomorTelepon: '089988776655', jenisKelamin: 'Pria', umur: 31, statusPernikahan: 'Menikah' },
  { id: '6', nama: 'Dewi Rahma', pekerjaan: 'HRD', nomorTelepon: '081231231231', jenisKelamin: 'Wanita', umur: 40, statusPernikahan: 'Cerai' },
  { id: '7', nama: 'Faisal Akbar', pekerjaan: 'Analis', nomorTelepon: '082233445566', jenisKelamin: 'Pria', umur: 26, statusPernikahan: 'Lajang' },
  { id: '8', nama: 'Lina Natalia', pekerjaan: 'Sekretaris', nomorTelepon: '081567890123', jenisKelamin: 'Wanita', umur: 38, statusPernikahan: 'Menikah' },
  { id: '9', nama: 'Teguh Saputra', pekerjaan: 'Operator', nomorTelepon: '081776655442', jenisKelamin: 'Pria', umur: 24, statusPernikahan: 'Lajang' },
  { id: '10', nama: 'Maya Sari', pekerjaan: 'Supervisor', nomorTelepon: '081887766554', jenisKelamin: 'Wanita', umur: 33, statusPernikahan: 'Menikah' },
  { id: '11', nama: 'Andre Wijaya', pekerjaan: 'Developer', nomorTelepon: '081234098765', jenisKelamin: 'Pria', umur: 29, statusPernikahan: 'Lajang' },
  { id: '12', nama: 'Citra Dewi', pekerjaan: 'Designer', nomorTelepon: '081110099887', jenisKelamin: 'Wanita', umur: 36, statusPernikahan: 'Menikah' },
  { id: '13', nama: 'Hendra Kusuma', pekerjaan: 'Manager', nomorTelepon: '085678123456', jenisKelamin: 'Pria', umur: 48, statusPernikahan: 'Menikah' },
  // Tambah data lain untuk menguji pagination
  ...Array.from({ length: 17 }).map((_, i) => ({
    id: String(i + 14),
    nama: `Karyawan ${i + 14}`,
    pekerjaan: i % 3 === 0 ? 'Staf' : 'Intern',
    nomorTelepon: `08000000${i + 14}`,
    jenisKelamin: i % 2 === 0 ? 'Pria' : 'Wanita',
    umur: 20 + i,
    statusPernikahan: i % 4 === 0 ? 'Menikah' : 'Lajang',
  })),
]

// Hook to manage table data. By default returns mockData and a fetch helper.
// Usage:
// const { data, setData, fetchData } = useTable({ apiUrl: '/api/customers', initial: mockData })
export function useTable({ apiUrl = null, initial = mockData } = {}) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchData(params = {}) {
    if (!apiUrl) return
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams(params).toString()
      const url = query ? `${apiUrl}?${query}` : apiUrl
      const res = await fetch(url)
      if (!res.ok) throw new Error('Network response was not ok')
      const json = await res.json()
      setData(json)
      setLoading(false)
      return json
    } catch (err) {
      setError(err)
      setLoading(false)
      return null
    }
  }

  // optional auto-fetch when apiUrl provided
  useEffect(() => {
    if (!apiUrl) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl])

  return { data, setData, fetchData, loading, error }
}

export default useTable
