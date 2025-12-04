import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function useLeadDetail(leadId, enabled = true) {
  const [ data, setData ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [error, setError ] = useState(null);

  useEffect(() => {
    if(!enabled || !leadId) return;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/sales/leads/${leadId}`);
        setData(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [leadId, enabled]);

  return { data, error, loading };
}
