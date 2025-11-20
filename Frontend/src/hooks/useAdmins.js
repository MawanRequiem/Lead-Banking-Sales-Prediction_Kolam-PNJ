import { useMemo } from 'react'

// Simple hook returning mock admins for the new admin table.
export function useAdmins() {
  const data = useMemo(() => [
    {
      id: 'a1',
      nama: 'Rian Pratama',
      email: 'rian.pratama@example.com',
      role: 'sales',
      status: 'active',
    },
    {
      id: 'a2',
      nama: 'Siti Aminah',
      email: 'siti.aminah@example.com',
      role: 'admin',
      status: 'inactive',
    },
    {
      id: 'a3',
      nama: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      role: 'sales',
      status: 'active',
    },
  ], [])

  return { data, loading: false }
}

export default useAdmins
