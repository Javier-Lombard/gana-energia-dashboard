import { useCallback, useEffect, useState } from 'react';
import { getContracts } from '../api/services';
import type { Contract } from '../types';

interface UseContractsResult {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContracts(): UseContractsResult {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchContracts() {
      setLoading(true);
      setError(null);
      try {
        const data = await getContracts();
        if (!cancelled) {
          setContracts(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error desconocido al obtener los contratos',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchContracts();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { contracts, loading, error, refetch };
}
