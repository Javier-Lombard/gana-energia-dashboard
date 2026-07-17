import styles from './Toggle.module.css';

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  options: ToggleOption[];
  selected: string;
  onChange: (value: string) => void;
}

export function Toggle({ options, selected, onChange }: ToggleProps) {
  return (
    <div className={styles.toggle} role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={
            option.value === selected
              ? `${styles.option} ${styles.optionActive}`
              : styles.option
          }
          aria-pressed={option.value === selected}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
