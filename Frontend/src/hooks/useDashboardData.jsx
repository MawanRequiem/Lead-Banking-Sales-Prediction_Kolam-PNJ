import { useEffect, useState, useRef, useCallback } from "react";
import axios from "@/lib/axios";

// Hook to fetch combined dashboard summary from backend and expose slices
export default function useDashboardData({
  year,
  month,
  wholeYear,
  interval,
} = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const buildInterval = () => {
    if (interval) return interval;
    if (wholeYear) return "month";
    // when month selected, we want weekly buckets
    return "week";
  };

  const fetchData = useCallback(
    async (opts = {}) => {
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch {}
      }

      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      setLoading(true);
      setError(null);

      try {
        const params = {
          interval: buildInterval(),
        };

        if (year) params.year = year;
        if (!wholeYear && month) params.month = month;

        const res = await axios.get("/sales/dashboard", {
          params,
          signal: ctrl.signal,
        });
        const payload = res?.data?.data || res?.data || null;
        setData(payload);
        setLoading(false);
        return payload;
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setError(err);
        setLoading(false);
        throw err;
      } finally {
        controllerRef.current = null;
      }
    },
    [year, month, wholeYear, interval]
  );

  useEffect(() => {
    // initial fetch
    fetchData().catch(() => {});
    return () => {
      if (controllerRef.current)
        try {
          controllerRef.current.abort();
        } catch {}
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
