import type { Contract } from '../../types';
import { ErrorMessage } from '../ui/ErrorMessage/ErrorMessage';
import styles from './TariffCard.module.css';

interface TariffCardProps {
  contract: Contract | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TariffCard({
  contract,
  loading,
  error = null,
  onRetry,
}: TariffCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tu tarifa actual</h2>
        <span className={styles.icon} aria-hidden="true">
          💡
        </span>
      </div>

      {loading ? (
        <div className={styles.skeleton}>
          <div className={styles.skeletonPill} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      ) : error && onRetry ? (
        <ErrorMessage message={error} onRetry={onRetry} />
      ) : !contract ? (
        <p className={styles.emptyMessage}>No hay ningún contrato seleccionado.</p>
      ) : (
        <div className={styles.content}>
          <span className={styles.tariffPill}>{contract.tarifa_nombre}</span>

          <div className={styles.powerRow}>
            <span className={styles.field}>
              <span className={styles.label}>P1:</span>{' '}
              <span className={styles.value}>{contract.potencia_p1_kw} kW</span>
            </span>
            <span className={styles.field}>
              <span className={styles.label}>P2:</span>{' '}
              <span className={styles.value}>{contract.potencia_p2_kw} kW</span>
            </span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>CUPS:</span>{' '}
            <span className={styles.value}>{contract.cups}</span>
          </div>
        </div>
      )}
    </div>
  );
}
