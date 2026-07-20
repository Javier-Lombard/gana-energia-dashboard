import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ConsumptionRecord, ViewMode } from '../../types';
import { Toggle } from '../Toggle/Toggle';
import { Pagination } from '../Pagination/Pagination';
import { ErrorMessage } from '../ui/ErrorMessage/ErrorMessage';
import styles from './BillingChart.module.css';

const SKELETON_BAR_HEIGHTS = [55, 80, 45, 95, 65, 40, 85, 60, 100, 50, 75, 35];

interface BillingChartProps {
  consumption: ConsumptionRecord[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface ChartSlot {
  key: string;
  mes: string;
  anio: string;
  value: number | null;
}

const ITEMS_PER_PAGE = 12;
const BAR_SIZE = 32;
const BAR_COLOR = '#3ccfaf';
const BAR_COLOR_ACTIVE = '#a8efe0';

function formatValue(value: number, viewMode: ViewMode): string {
  const formatted = value.toLocaleString('es-ES', {
    minimumFractionDigits: viewMode === 'eur' ? 2 : 0,
    maximumFractionDigits: viewMode === 'eur' ? 2 : 0,
  });
  return viewMode === 'eur' ? `${formatted}€` : `${formatted}kWh`;
}

function buildSlots(
  pageRecords: ConsumptionRecord[],
  viewMode: ViewMode,
): ChartSlot[] {
  const slots: ChartSlot[] = pageRecords.map((record) => ({
    key: `${record.anio}-${record.mes_num}-${record.id}`,
    mes: record.mes.slice(0, 3).toUpperCase(),
    anio: record.anio,
    value: viewMode === 'eur' ? record.eur : record.kwh,
  }));

  while (slots.length < ITEMS_PER_PAGE) {
    slots.push({
      key: `empty-${slots.length}`,
      mes: '',
      anio: '',
      value: null,
    });
  }

  return slots;
}

interface AxisTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
  slots: ChartSlot[];
}

function XAxisTick({ x, y, payload, slots }: AxisTickProps) {
  const slot = slots.find((item) => item.key === payload?.value);
  if (!slot || slot.mes === '') {
    return null;
  }

  return (
    <text x={x} y={y} textAnchor="middle">
      <tspan x={x} dy="1em" className={styles.tickMonth}>
        {slot.mes}
      </tspan>
      <tspan x={x} dy="1.3em" className={styles.tickYear}>
        {slot.anio}
      </tspan>
    </text>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartSlot }>;
  viewMode: ViewMode;
}

function CustomTooltip({ active, payload, viewMode }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const slot = payload[0].payload;
  if (slot.value === null) {
    return null;
  }

  return (
    <div className={styles.tooltip}>{formatValue(slot.value, viewMode)}</div>
  );
}

function getYAxisMax(slots: ChartSlot[]): number {
  const max = Math.max(0, ...slots.map((slot) => slot.value ?? 0));
  return max === 0 ? 10 : Math.ceil((max * 1.2) / 25) * 25;
}

export function BillingChart({
  consumption,
  viewMode,
  onViewModeChange,
  loading,
  error,
  onRetry,
}: BillingChartProps) {
  const totalPages = Math.max(1, Math.ceil(consumption.length / ITEMS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(totalPages);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(Math.max(1, Math.ceil(consumption.length / ITEMS_PER_PAGE)));
  }, [consumption]);

  const pageRecords = consumption.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const slots = buildSlots(pageRecords, viewMode);
  const yAxisMax = getYAxisMax(slots);
  const yAxisTicks = [0, yAxisMax / 4, yAxisMax / 2, (yAxisMax * 3) / 4, yAxisMax];

  function goToPage(page: number) {
    setCurrentPage(page);
    setActiveKey(null);
  }

  return (
    <div className={styles.card}>
      <Toggle
        options={[
          { value: 'eur', label: '€' },
          { value: 'kwh', label: 'kWh' },
        ]}
        selected={viewMode}
        onChange={(value) => onViewModeChange(value as ViewMode)}
      />

      {loading ? (
        <div className={styles.skeleton} aria-label="Cargando historial de facturación">
          {SKELETON_BAR_HEIGHTS.map((height, index) => (
            <div
              key={index}
              className={styles.skeletonBar}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      ) : error ? (
        <div className={styles.stateBlock}>
          <ErrorMessage message={error} onRetry={onRetry} />
        </div>
      ) : consumption.length === 0 ? (
        <div className={styles.stateBlock}>
          <span className={styles.emptyIcon} aria-hidden="true">
            🌵
          </span>
          <p className={styles.emptyMessage}>
            Aún no hemos emitido ninguna factura.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={slots}
                barSize={BAR_SIZE}
                margin={{ top: 40, right: 8, left: 0, bottom: 8 }}
                onMouseLeave={() => setActiveKey(null)}
              >
                <CartesianGrid vertical={false} stroke="#e2e6ea" />
                <XAxis
                  dataKey="key"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={40}
                  tick={(props) => <XAxisTick {...props} slots={slots} />}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                  tickFormatter={(value: number) =>
                    viewMode === 'kwh' ? `${value}kWh` : `${value}€`
                  }
                  width={56}
                />
                <Tooltip
                  cursor={false}
                  content={<CustomTooltip viewMode={viewMode} />}
                />
                <Bar
                  dataKey="value"
                  radius={[16, 16, 0, 0]}
                  onMouseEnter={(data) =>
                    setActiveKey((data.payload as ChartSlot).key)
                  }
                  isAnimationActive={false}
                >
                  {slots.map((slot) => (
                    <Cell
                      key={slot.key}
                      fill={slot.key === activeKey ? BAR_COLOR_ACTIVE : BAR_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
}
