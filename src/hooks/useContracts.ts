import { useEffect, useState } from "react";
import { getContracts } from "../api/services";
import type { Contract } from "../types";

interface UseContractsResult {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
}

export function useContracts(): UseContractsResult {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
              : "Error desconocido al obtener los contratos"
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
  }, []);

  return { contracts, loading, error };
}
