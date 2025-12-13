import { useState, useEffect } from "react";
import axios from "@/lib/axios";

function useOverview({ apiUrl, initial = [] } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData(params = {}) {
    if (!apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      if (apiUrl === "/sales/leads/overview") {
        const response = await axios.get(apiUrl, { params });
        setData(response.data.data);
        setLoading(false);
        return response.data;
      } else if (apiUrl === "/sales/assignments/overview") {
        const response = await axios.get(apiUrl, { params });
        setData(response.data.data);
        setLoading(false);
        return response.data;
      }
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

function useLeadOverview() {
  return useOverview({ apiUrl: "/sales/leads/overview" });
}

function useMyLeadOverview() {
  return useOverview({ apiUrl: "/sales/assignments/overview" });
}

export { useLeadOverview, useMyLeadOverview };
