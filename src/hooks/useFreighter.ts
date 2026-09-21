import { useState, useEffect, useCallback } from "react";
import { connectFreighter, isFreighterAvailable, getUsdcBalance } from "../lib/stellar";
import type { WalletInfo } from "../types";

interface UseFreighterReturn {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export function useFreighter(): UseFreighterReturn {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect if previously connected
  useEffect(() => {
    const saved = localStorage.getItem("pactopay_wallet");
    if (saved && isFreighterAvailable()) {
      connectFreighter()
        .then((info) => {
          setWallet({ ...info, balance: 0 });
          getUsdcBalance(info.address).then((balance) => {
            setWallet((prev) => (prev ? { ...prev, balance } : null));
          });
        })
        .catch(() => {
          localStorage.removeItem("pactopay_wallet");
        });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isFreighterAvailable()) {
      setError("Freighter no está instalado. Instálalo desde freighter.app");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const info = await connectFreighter();
      const balance = await getUsdcBalance(info.address);
      setWallet({ ...info, balance });
      localStorage.setItem("pactopay_wallet", "connected");
    } catch (err: any) {
      setError(err.message || "Error al conectar billetera");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    localStorage.removeItem("pactopay_wallet");
  }, []);

  const refreshBalance = useCallback(async () => {
    if (wallet) {
      const balance = await getUsdcBalance(wallet.address);
      setWallet((prev) => (prev ? { ...prev, balance } : null));
    }
  }, [wallet]);

  return {
    wallet,
    isConnecting,
    isConnected: !!wallet,
    error,
    connect,
    disconnect,
    refreshBalance,
  };
}
