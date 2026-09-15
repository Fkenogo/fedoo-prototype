import React, { createContext, useContext } from 'react';
import { Location } from '../types';

interface ScopeContextType {
  currentScope: string; // 'all' or locationId
  scopeLocationName: string;
  locations: Location[];
  setCurrentScope: (scopeId: string) => void;
  isMultiLocation: boolean;
}

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export interface ScopeProviderProps {
  currentScope: string;
  scopeLocationName: string;
  locations: Location[];
  setCurrentScope: (scopeId: string) => void;
  children: React.ReactNode;
}

export const ScopeProvider: React.FC<ScopeProviderProps> = ({
  currentScope,
  scopeLocationName,
  locations,
  setCurrentScope,
  children,
}) => {
  return (
    <ScopeContext.Provider
      value={{
        currentScope,
        scopeLocationName,
        locations,
        setCurrentScope,
        isMultiLocation: locations.length > 1,
      }}
    >
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = (): ScopeContextType => {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error('useScope must be used within a ScopeProvider');
  }
  return context;
};
