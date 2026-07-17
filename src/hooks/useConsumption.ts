import { useEffect, useState } from "react";
import { getConsumption } from "../api/services";
import type { ConsumptionRecord } from "../types";

interface UseConsumptionResult {
  consumption: ConsumptionRecord[];
  loading: boolean;
  error: string | null;
}

export function useConsumption(
  contractId: number | null
): UseConsumptionResult {
  const [consumption, setConsumption] = useState<ConsumptionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contractId === null) {
      setConsumption([]);
      setLoading(false);
      setError(null);
      return;
    }

    const id = contractId;
    let cancelled = false;

    async function fetchConsumption() {
      setLoading(true);
      setError(null);
      try {
        const data = await getConsumption(id);
        if (!cancelled) {
          setConsumption(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Error desconocido al obtener el historial de consumo"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConsumption();

    return () => {
      cancelled = true;
    };
  }, [contractId]);

  return { consumption, loading, error };
}
