import useTable from '@/hooks/useTable'

// Mock data for the new customers overview table
export const mockCustomersOverview = [
  { id: 'c1', nama: 'Andi Wijaya', nomorTelepon: '081234567890', jenisKelamin: 'Pria', statusNasabah: 'Dalam Panggilan', kategori: 'A', pekerjaan: 'Sales', umur: 30 },
  { id: 'c2', nama: 'Sari Melati', nomorTelepon: '081198765432', jenisKelamin: 'Wanita', statusNasabah: 'Tersedia', kategori: 'B', pekerjaan: 'Customer', umur: 29 },
  { id: 'c3', nama: 'Budi Hartono', nomorTelepon: '082233445566', jenisKelamin: 'Pria', statusNasabah: 'Assign', kategori: 'C', pekerjaan: 'Manager', umur: 41 },
  { id: 'c4', nama: 'Tina Kartika', nomorTelepon: '081122334455', jenisKelamin: 'Wanita', statusNasabah: 'Tersedia', kategori: 'A', pekerjaan: 'Staff', umur: 26 },
  { id: 'c5', nama: 'Riko Saputra', nomorTelepon: '085566778899', jenisKelamin: 'Pria', statusNasabah: 'Dalam Panggilan', kategori: 'B', pekerjaan: 'Support', umur: 35 },
]

export function useCustomersOverview() {
  // Reuse existing useTable hook to provide data/loading semantics
  const { data, loading, setData, fetchData } = useTable({ initial: mockCustomersOverview })
  return { data, loading, setData, fetchData }
}

export default useCustomersOverview
