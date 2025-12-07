import { useState, useEffect, useCallback } from 'react'
import axios from '@/lib/axios' // Pastikan Anda punya konfigurasi axios instance

export function useAssignments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, total: 0, pageCount: 0 });
  const [search, setSearch] = useState('');

  const fetchAssignments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get('/sales/assignments', { params });
      const {data, meta} = response.data;
      const { total, lastPage } = meta.pagination;
      setData(data);
      setPagination((old) => ({...old, total, pageCount: lastPage }));
    } catch (err) {
      console.error("Gagal mengambil data assignment:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search,
    })
  }, [fetchAssignments, pagination.pageIndex, pagination.pageSize, search]);

  return { data, loading, error, refetch: fetchAssignments, pagination, setPagination, search, setSearch };
}
