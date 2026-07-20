import { useContractContext } from '../../context/ContractContext';
import { ContractDropdown } from '../ContractDropdown/ContractDropdown';
import type { Contract } from '../../types';
import styles from './Header.module.css';
import { GanarIcon } from '../ui/GanarIcon';
interface HeaderProps {
  contracts: Contract[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function Header({ contracts, loading, error, onRetry }: HeaderProps) {
  const { state, dispatch } = useContractContext();

  function handleSelect(id: number) {
    dispatch({ type: 'SELECT_CONTRACT', payload: id });
  }

  return (
    <header className={styles.header}>
      <div className={styles.logoBlock}>
        <div className={styles.logo}>
         <GanarIcon/>
         
        </div>
        <span className={styles.badge}>Área Cliente</span>
      </div>

      <div className={styles.centerBlock}>
        <img className={styles.avatar} src="https://i.pravatar.cc/40" alt="" />
        <span className={styles.greeting}>¡Hola, María! 👋 Estás viendo:</span>
        <ContractDropdown
          contracts={contracts}
          selectedId={state.selectedContractId}
          onSelect={handleSelect}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.contractButton}
          onClick={() => console.log('Contratar')}
        >
          Contratar
        </button>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => console.log('Salir')}
        >
          Salir
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 11 14 8l-3.5-3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 8H6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
