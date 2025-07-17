import { useState, useEffect } from 'react';
import { ApiError } from '../api/client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * API呼び出しを管理するカスタムフック
 * @param apiCall - 実行するAPI関数
 * @returns API状態とrefetch関数
 */
export function useApi<T>(
  apiCall: () => Promise<{ data?: T; error?: string }>
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      if (response.error) {
        setState({
          data: null,
          loading: false,
          error: response.error,
        });
      } else {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof ApiError ? error.message : '不明なエラーが発生しました',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...state,
    refetch: fetchData,
  };
}