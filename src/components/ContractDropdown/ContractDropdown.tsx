import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Contract } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';
import styles from './ContractDropdown.module.css';

interface ContractDropdownProps {
  contracts: Contract[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function formatContractLabel(contract: Contract): string {
  return `${contract.tipo_suministro} · ${contract.estado} · ${contract.direccion}`;
}

export function ContractDropdown({
  contracts,
  selectedId,
  onSelect,
}: ContractDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedContract = contracts.find(
    (contract) => contract.id === selectedId,
  );

  function handleSelect(id: number) {
    onSelect(id);
    setIsOpen(false);
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLLIElement>, id: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(id);
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="contract-dropdown-listbox"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.triggerText}>
          {selectedContract
            ? formatContractLabel(selectedContract)
            : 'Selecciona un contrato'}
        </span>
        <svg
          className={
            isOpen ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron
          }
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul id="contract-dropdown-listbox" role="listbox" className={styles.panel}>
          {contracts.map((contract) => (
            <li
              key={contract.id}
              role="option"
              aria-selected={contract.id === selectedId}
              tabIndex={0}
              className={styles.option}
              onClick={() => handleSelect(contract.id)}
              onKeyDown={(event) => handleOptionKeyDown(event, contract.id)}
            >
              {formatContractLabel(contract)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
