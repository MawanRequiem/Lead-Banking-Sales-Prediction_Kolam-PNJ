import { useState, useEffect, useCallback } from 'react'
import axios from '../lib/axios'

// Hook that fetches users which are either admin or sales from the backend
export function useAdmins({ page = 1, limit = 50 } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page, limit, total: 0 })

  const fetchAdmins = useCallback(async (opts = {}) => {
    setLoading(true)
    setError(null)
    try {
      const p = opts.page || page
      const l = opts.limit || limit
      const res = await axios.get(`/admin/sales?page=${p}&limit=${l}`, { withCredentials: true })

      // response shape: { success, requestId, ..., data: { users: [...] }, meta: { pagination: { ... } } }
      // backend may return `sales` or `users` depending on endpoint; prefer `sales`
      const items = res?.data?.data?.sales || res?.data?.data?.users || []
      const meta = res?.data?.meta || {}
      const pag = meta.pagination || { page: p, limit: l, total: (meta.total || 0) }

      // Map backend item shape into table-friendly shape expected by columns/dialogs
      const mapped = items.map((u) => {
        // name may be present directly (sales.nama) or in related payload
        const nameFromDirect = u.nama || u.name || null
        const nameFromRelated = u.related && u.related.name ? u.related.name : null
        // email usually lives under user.email for sales records
        const email = (u.user && u.user.email) || u.email
        const fallbackName = email ? email.split('@')[0] : ''

        // status is stored on user.isActive for sales/admin relations
        const isActive = (typeof u.isActive !== 'undefined') ? u.isActive : (u.user && typeof u.user.isActive !== 'undefined' ? u.user.isActive : undefined)

        return {
          // keep original properties for future use
          ...u,
          // UI expects `nama`, `email` and `status` fields
          nama: nameFromDirect || nameFromRelated || fallbackName,
          email,
          status: (typeof isActive !== 'undefined') ? (isActive ? 'active' : 'inactive') : (u.status || 'inactive'),
          // set role explicitly when this is a sales record
          role: u.role || (u.idSales ? 'sales' : (u.admin ? 'admin' : (u.sales ? 'sales' : u.role))),
          // include an `id` for table row identity if needed
          id: u.idSales || u.idUser || u.id || email,
        }
      })

      setData(mapped)
      setPagination(pag)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return
      await fetchAdmins()
    })()
    return () => { mounted = false }
  }, [fetchAdmins])

  return { data, loading, error, pagination, refetch: fetchAdmins }
}

export default useAdmins
