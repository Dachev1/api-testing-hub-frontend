import { useState, useCallback } from 'react';
import type { ApiResponse, RequestConfig, UseApiOptions } from '@/types';
import { ApiService } from '@/services';

export const useApi = (options?: UseApiOptions) => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(async (config: RequestConfig) => {
    if (!config.url.trim()) {
      setError('URL is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await ApiService.makeRequest(config);
      setResponse(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    response,
    loading,
    error,
    sendRequest,
    clearResponse,
    clearError,
  };
}; 