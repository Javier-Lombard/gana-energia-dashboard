import { useEffect } from 'react';
import { Header } from './components/Header/Header';
import { WelcomeCard } from './components/WelcomeCard/WelcomeCard';
import { TariffCard } from './components/TariffCard/TariffCard';
import { BillingChart } from './components/BillingChart/BillingChart';
import { ContractProvider, useContractContext } from './context/ContractContext';
import { useContracts } from './hooks/useContracts';
import { useConsumption } from './hooks/useConsumption';
import styles from './App.module.css';

function Dashboard() {
  const { state, dispatch } = useContractContext();
  const { contracts, loading: contractsLoading } = useContracts();
  const { consumption, loading, error, refetch } = useConsumption(
    state.selectedContractId,
  );

  useEffect(() => {
    if (contracts.length > 0 && state.selectedContractId === null) {
      dispatch({ type: 'SELECT_CONTRACT', payload: contracts[0].id });
    }
  }, [contracts, state.selectedContractId, dispatch]);

  const selectedContract =
    contracts.find((contract) => contract.id === state.selectedContractId) ??
    null;

  return (
    <>
      <Header contracts={contracts} />
      <main className={styles.main}>
        <div className={styles.leftColumn}>
          <WelcomeCard />
          <TariffCard contract={selectedContract} loading={contractsLoading} />
        </div>
        <BillingChart
          consumption={consumption}
          viewMode={state.viewMode}
          onViewModeChange={(mode) =>
            dispatch({ type: 'SET_VIEW_MODE', payload: mode })
          }
          loading={loading}
          error={error}
          onRetry={refetch}
        />
      </main>
    </>
  );
}

function App() {
  return (
    <ContractProvider>
      <Dashboard />
    </ContractProvider>
  );
}

export default App;
