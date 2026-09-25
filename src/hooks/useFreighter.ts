import { useState, useEffect, useCallback, useRef } from "react";
import { connectFreighter, isFreighterAvailable, isFreighterInstalled, getUsdcBalance } from "../lib/stellar";
import type { WalletInfo } from "../types";

interface UseFreighterReturn {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  isConnected: boolean;
  isFreighterInstalled: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export function useFreighter(): UseFreighterReturn {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFreighterInstalledState, setIsFreighterInstalled] = useState(
    () => isFreighterAvailable()
  );
  const checkingRef = useRef(false);
  const installedRef = useRef(isFreighterInstalledState);
  const didAutoConnectRef = useRef(false);

  // Async availability check via the official Freighter API, with the sync
  // bridge check as fallback so first paint stays sane. Never caches a
  // negative result permanently: every poll and every connect click re-checks.
  const checkInstalled = useCallback(async (): Promise<boolean> => {
    if (checkingRef.current) {
      return installedRef.current;
    }
    checkingRef.current = true;
    try {
      const installed = await isFreighterInstalled();
      const result = installed || isFreighterAvailable();
      installedRef.current = result;
      setIsFreighterInstalled(result);
      return result;
    } catch {
      const fallback = isFreighterAvailable();
      installedRef.current = fallback;
      setIsFreighterInstalled(fallback);
      return fallback;
    } finally {
      checkingRef.current = false;
    }
  }, []);

  // Check Freighter availability on mount and periodically
  useEffect(() => {
    void checkInstalled();
    const interval = setInterval(() => {
      void checkInstalled();
    }, 2000);
    return () => clearInterval(interval);
  }, [checkInstalled]);

  // Auto-connect if previously connected (runs once)
  useEffect(() => {
    const saved = localStorage.getItem("pactopay_wallet");
    if (!saved || didAutoConnectRef.current) {
      return;
    }
    didAutoConnectRef.current = true;
    let cancelled = false;
    (async () => {
      const installed = await checkInstalled();
      if (!installed || cancelled) {
        return;
      }
      try {
        const info = await connectFreighter();
        if (cancelled) {
          return;
        }
        setWallet({ ...info, balance: 0 });
        const balance = await getUsdcBalance(info.address);
        if (!cancelled) {
          setWallet((prev) => (prev ? { ...prev, balance } : null));
        }
      } catch {
        localStorage.removeItem("pactopay_wallet");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkInstalled]);

  const connect = useCallback(async (): Promise<boolean> => {
    // Re-check on every click — never trust a stale "not installed".
    const installed = await checkInstalled();
    if (!installed) {
      setError("Freighter no está instalado. Instalalo desde freighter.app");
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const info = await connectFreighter();
      const balance = await getUsdcBalance(info.address);
      setWallet({ ...info, balance });
      localStorage.setItem("pactopay_wallet", "connected");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Error al conectar billetera");
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [checkInstalled]);

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
    isFreighterInstalled: isFreighterInstalledState,
    error,
    connect,
    disconnect,
    refreshBalance,
  };
}
