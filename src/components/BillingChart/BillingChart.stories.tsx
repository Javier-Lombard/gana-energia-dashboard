import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BillingChart } from './BillingChart';
import type { ConsumptionRecord, ViewMode } from '../../types';

const MESES = [
  'Nov',
  'Dic',
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
];

function buildConsumption(count: number): ConsumptionRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const kwh = 80 + Math.round(Math.random() * 60);
    return {
      id: index + 1,
      contract_id: 1,
      mes: MESES[index % 12],
      anio: index < 2 ? '23' : '24',
      mes_num: (index % 12) + 1,
      anio_completo: index < 2 ? 2023 : 2024,
      kwh,
      eur: Math.round(kwh * 0.65 * 100) / 100,
    };
  });
}

const fullHistory = buildConsumption(30);
const partialPageHistory = buildConsumption(15);

function InteractiveWrapper(props: {
  consumption: ConsumptionRecord[];
  loading?: boolean;
  error?: string | null;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('eur');
  return (
    <div style={{ width: 800 }}>
      <BillingChart
        consumption={props.consumption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        loading={props.loading ?? false}
        error={props.error ?? null}
        onRetry={fn()}
      />
    </div>
  );
}

const meta = {
  title: 'Components/BillingChart',
  component: BillingChart,
  parameters: {
    layout: 'centered',
  },
  args: {
    consumption: fullHistory,
    viewMode: 'eur',
    onViewModeChange: fn(),
    loading: false,
    error: null,
    onRetry: fn(),
  },
} satisfies Meta<typeof BillingChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <InteractiveWrapper consumption={fullHistory} />,
};

export const PaginaIncompleta: Story = {
  render: () => <InteractiveWrapper consumption={partialPageHistory} />,
};

export const Cargando: Story = {
  render: () => <InteractiveWrapper consumption={[]} loading />,
};

export const ConError: Story = {
  render: () => (
    <InteractiveWrapper
      consumption={[]}
      error="No se pudo conectar con el servidor para obtener el historial de consumo"
    />
  ),
};

export const SinFacturas: Story = {
  render: () => <InteractiveWrapper consumption={[]} />,
};
