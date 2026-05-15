import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = unknown>(url: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      if (mountedRef.current) {
        setData(response.data);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err instanceof Error && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
        setError(msg || '加载失败');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async <T = unknown>(fn: () => Promise<unknown>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn() as { data: T };
      return result.data;
    } catch (err) {
      const msg = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      if (!msg) throw err;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, call, setError };
}
