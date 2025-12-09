import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export default function useLeadOverview({ apiUrl = "/sales/leads/overview", initial = [] } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData(params = {}) {
    if (!apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(apiUrl, { params });
      setData(response.data.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      return null;
    }
  }

  // optional auto-fetch when apiUrl provided
  useEffect(() => {
    if (!apiUrl) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  return { data, loading, error, fetchData, setData };
}
