import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'Error inesperado capturado por ErrorBoundary:',
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.block}>
          <span className={styles.icon} aria-hidden="true">
            😵
          </span>
          <h1 className={styles.title}>Algo salió mal</h1>
          <p className={styles.message}>
            Ha ocurrido un error inesperado. Prueba a recargar la página.
          </p>
          <button
            type="button"
            className={styles.reloadButton}
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
