import useTable from '@/hooks/useTable'

const mockData = [
  { id: 'H-20251118-001', time: '2025-11-18 10:00', namaNasabah: 'Andika Setyawan', agent: 'Ari', duration: '00:05:23', result: 'Terkoneksi', grade: 'A', note: 'Pembicaraan lancar, follow up minggu depan.' },
  { id: 'H-20251118-002', time: '2025-11-18 11:30', namaNasabah: 'Cahya Setiawan', agent: 'Budi', duration: '00:02:10', result: 'Voicemail', grade: 'B', note: 'Sampai voicemail, coba ulang besok.' },
]

// Wrapper around generic `useTable` so call-history follows same API.
// Usage: useCallHistory({ apiUrl?: string, initial?: Array })
export default function useCallHistory({ apiUrl = null, initial } = {}) {
  const opts = { apiUrl, initial: initial && initial.length ? initial : mockData }
  return useTable(opts)
}
