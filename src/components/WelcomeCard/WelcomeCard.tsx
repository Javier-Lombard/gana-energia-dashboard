import styles from './WelcomeCard.module.css';

function formatToday(): string {
  const formatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function WelcomeCard() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>¡Hola, María! 👋 Este es tu Área Cliente</h2>
      <p className={styles.date}>{formatToday()}</p>
    </div>
  );
}
