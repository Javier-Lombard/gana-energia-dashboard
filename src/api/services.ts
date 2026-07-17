import type { ApiError, Contract, ConsumptionRecord } from '../types';

const BASE_URL = 'https://gana-front.vercel.app';

async function parseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getContracts(): Promise<Contract[]> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/contracts`);
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor para obtener los contratos',
    );
  }

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        `Error al obtener los contratos (HTTP ${response.status})`,
      ),
    );
  }

  return (await response.json()) as Contract[];
}

export async function getConsumption(
  contractId: number,
): Promise<ConsumptionRecord[]> {
  let response: Response;
  try {
    response = await fetch(
      `${BASE_URL}/api/consumption?contract_id=${contractId}`,
    );
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor para obtener el historial de consumo',
    );
  }

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        `Error al obtener el historial de consumo (HTTP ${response.status})`,
      ),
    );
  }

  return (await response.json()) as ConsumptionRecord[];
}
