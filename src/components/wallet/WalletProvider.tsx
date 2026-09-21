import { createContext, useContext, type ReactNode } from "react";
import { useFreighter } from "../../hooks/useFreighter";
import type { WalletInfo } from "../../types";

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => false,
  disconnect: () => {},
  refreshBalance: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const freighter = useFreighter();

  return (
    <WalletContext.Provider value={freighter}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
