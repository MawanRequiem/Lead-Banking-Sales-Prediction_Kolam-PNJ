import { useState, useEffect, useCallback } from 'react'
import axios from '@/lib/axios'

// Dummy data moved here so table definitions remain clean.
export const mockData = [
  { id: '1', nama: 'Budi Santoso', pekerjaan: 'Developer', nomorTelepon: '081234567890', jenisKelamin: 'Pria', umur: 28, domisili: 'Jakarta', statusPernikahan: 'Lajang', statusNasabah: 'Dalam Panggilan', kategori: 'A' },
  { id: '2', nama: 'Siti Aisyah', pekerjaan: 'Designer', nomorTelepon: '081112233445', jenisKelamin: 'Wanita', umur: 35, domisili: 'Bandung', statusPernikahan: 'Menikah', statusNasabah: 'Tersedia', kategori: 'B' },
  { id: '3', nama: 'Joko Prabowo', pekerjaan: 'Manager', nomorTelepon: '085678901234', jenisKelamin: 'Pria', umur: 45, domisili: 'Surabaya', statusPernikahan: 'Menikah', statusNasabah: 'Assign', kategori: 'C' },
  { id: '4', nama: 'Ayu Lestari', pekerjaan: 'Akuntan', nomorTelepon: '087776655443', jenisKelamin: 'Wanita', umur: 22, domisili: 'Medan', statusPernikahan: 'Lajang', statusNasabah: 'Tersedia', kategori: 'A' },
  { id: '5', nama: 'Rian Hidayat', pekerjaan: 'Marketing', nomorTelepon: '089988776655', jenisKelamin: 'Pria', umur: 31, domisili: 'Semarang', statusPernikahan: 'Menikah', statusNasabah: 'Dalam Panggilan', kategori: 'B' },
  { id: '6', nama: 'Dewi Rahma', pekerjaan: 'HRD', nomorTelepon: '081231231231', jenisKelamin: 'Wanita', umur: 40, domisili: 'Yogyakarta', statusPernikahan: 'Cerai', statusNasabah: 'Assign', kategori: 'C' },
  { id: '7', nama: 'Faisal Akbar', pekerjaan: 'Analis', nomorTelepon: '082233445566', jenisKelamin: 'Pria', umur: 26, domisili: 'Bali', statusPernikahan: 'Lajang', statusNasabah: 'Tersedia', kategori: 'A' },
  { id: '8', nama: 'Lina Natalia', pekerjaan: 'Sekretaris', nomorTelepon: '081567890123', jenisKelamin: 'Wanita', umur: 38, domisili: 'Jakarta', statusPernikahan: 'Menikah', statusNasabah: 'Dalam Panggilan', kategori: 'B' },
  { id: '9', nama: 'Teguh Saputra', pekerjaan: 'Operator', nomorTelepon: '081776655442', jenisKelamin: 'Pria', umur: 24, domisili: 'Bandung', statusPernikahan: 'Lajang', statusNasabah: 'Assign', kategori: 'C' },
  { id: '10', nama: 'Maya Sari', pekerjaan: 'Supervisor', nomorTelepon: '081887766554', jenisKelamin: 'Wanita', umur: 33, domisili: 'Surabaya', statusPernikahan: 'Menikah', statusNasabah: 'Tersedia', kategori: 'A' },
  { id: '11', nama: 'Andre Wijaya', pekerjaan: 'Developer', nomorTelepon: '081234098765', jenisKelamin: 'Pria', umur: 29, domisili: 'Medan', statusPernikahan: 'Lajang', statusNasabah: 'Dalam Panggilan', kategori: 'B' },
  { id: '12', nama: 'Citra Dewi', pekerjaan: 'Designer', nomorTelepon: '081110099887', jenisKelamin: 'Wanita', umur: 36, domisili: 'Semarang',   statusPernikahan: 'Menikah', statusNasabah: 'Assign', kategori: 'C' },
  { id: '13', nama: 'Hendra Kusuma', pekerjaan: 'Manager', nomorTelepon: '085678123456', jenisKelamin: 'Pria', umur: 48, domisili: 'Yogyakarta', statusPernikahan: 'Menikah', statusNasabah: 'Tersedia', kategori: 'A' },
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
export function useTable({ apiUrl, initial = mockData, page, limit } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({pageIndex: page - 1 || 0, pageSize: limit || 10});
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async(params = {}) => {
    if (!apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(apiUrl, { params });
      setData(response.data.data);
      setTotal(response.data.meta?.pagination?.total);
      setPageCount(response.data.meta?.pagination?.lastPage);
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // optional auto-fetch when apiUrl provided
  useEffect(() => {
    fetchData({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search,
    });
  }, [ pagination, search, fetchData ]);

  return { data, setData, refetch: fetchData, loading, error, pagination, setPagination, pageCount, setPageCount, total, setTotal, search, setSearch };
}

export default useTable
