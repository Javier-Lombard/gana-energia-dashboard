export interface Contract {
  id: number;
  tipo_suministro: string;
  estado: string;
  direccion: string;
  tarifa_nombre: string;
  potencia_p1_kw: number;
  potencia_p2_kw: number;
  cups: string;
}

export interface ConsumptionRecord {
  id: number;
  contract_id: number;
  mes: string;
  anio: string;
  mes_num: number;
  anio_completo: number;
  kwh: number;
  eur: number;
}

export type ViewMode = "eur" | "kwh";

export interface ApiError {
  error: string;
}
