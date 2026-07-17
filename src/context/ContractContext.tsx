import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { ViewMode } from '../types';

export interface ContractState {
  selectedContractId: number | null;
  viewMode: ViewMode;
}

export type ContractAction =
  | { type: 'SELECT_CONTRACT'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode };

export interface ContractContextValue {
  state: ContractState;
  dispatch: Dispatch<ContractAction>;
}

const initialState: ContractState = {
  selectedContractId: null,
  viewMode: 'eur',
};

function contractReducer(
  state: ContractState,
  action: ContractAction,
): ContractState {
  switch (action.type) {
    case 'SELECT_CONTRACT':
      return { ...state, selectedContractId: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
  }
}

const ContractContext = createContext<ContractContextValue | undefined>(
  undefined,
);

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [state, dispatch] = useReducer(contractReducer, initialState);

  const value = useMemo<ContractContextValue>(
    () => ({ state, dispatch }),
    [state],
  );

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext(): ContractContextValue {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error(
      'useContractContext debe usarse dentro de un ContractProvider',
    );
  }
  return context;
}
