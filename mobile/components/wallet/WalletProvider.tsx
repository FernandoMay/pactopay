import React, { createContext, useContext, useState, useEffect } from 'react';
import useFreighter from '@/hooks/useFreighter';

type WalletContextValue = ReturnType<typeof useFreighter>;

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const freighter = useFreighter({ autoConnect: true });

  return (
    <WalletContext.Provider value={freighter}>{children}</WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};