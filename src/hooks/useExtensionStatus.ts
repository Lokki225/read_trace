import { useState, useEffect, useCallback } from 'react';
import { detectExtension, ExtensionDetectionResult } from '@/lib/extension/detector';

export interface UseExtensionStatusReturn {
  status: ExtensionDetectionResult | null;
  loading: boolean;
  error: string | null;
  recheckStatus: () => Promise<void>;
}

async function saveExtensionStatus(result: ExtensionDetectionResult): Promise<void> {
  try {
    await fetch('/api/extension/installed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browser_type: result.browser,
        extension_version: result.version ?? '1.0.0',
      }),
    });
  } catch (err) {
    console.error('Failed to save extension status:', err);
  }
}

export function useExtensionStatus(checkInterval?: number): UseExtensionStatusReturn {
  const [status, setStatus] = useState<ExtensionDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await detectExtension();
      setStatus(result);

      if (result.installed) {
        await saveExtensionStatus(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    if (checkInterval) {
      const intervalId = setInterval(checkStatus, checkInterval);
      return () => clearInterval(intervalId);
    }
  }, [checkStatus, checkInterval]);

  return {
    status,
    loading,
    error,
    recheckStatus: checkStatus,
  };
}
