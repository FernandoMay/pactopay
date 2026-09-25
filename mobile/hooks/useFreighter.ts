import { useEffect, useState, useCallback } from 'react';
import { Linking, Alert } from 'react-native';

// Tipos básicos para el hook móvil
export interface WalletInfo {
  address: string | null;
  isConnected: boolean;
  isFreighterInstalled: boolean;
  network: 'testnet' | 'mainnet' | 'unknown';
  balance: string; // USDC u otro activo
}

export interface ConnectResult {
  success: boolean;
  address?: string;
  error?: string;
}

export interface FreighterOptions {
  autoConnect?: boolean;
  showInstallButton?: boolean;
}

export class FreighterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FreighterError';
  }
}

// Hook principal para conectar con Freighter en móvil
export function useFreighter(options: FreighterOptions = {}) {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: null,
    isConnected: false,
    isFreighterInstalled: false,
    network: 'testnet',
    balance: '0.00',
  });

  const [pollInterval, setPollInterval] = useState<number | null>(null);

  // Detectar si Freighter está instalado
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        // Verificamos si podemos abrir el scheme de Freighter
        const canOpen = await canOpenFreighter();
        setWallet(prev => ({ ...prev, isFreighterInstalled: canOpen }));

        if (canOpen && options.autoConnect) {
          await connectWallet();
        }
      } catch (err) {
        console.error('Error checking Freighter:', err);
      }
    };

    checkFreighter();

    // Polling cada 5s para detectar cambios
    const interval = setInterval(checkFreighter, 5000) as unknown as number;
    setPollInterval(interval);

    return () => clearInterval(interval as NodeJS.Timeout);
  }, [options.autoConnect]);

  // Verificar si Freighter se puede abrir (instalado o scheme disponible)
  const canOpenFreighter = async (): Promise<boolean> => {
    try {
      const url = 'freighter://connect';
      const supported = [
        'freighter://',
        'freighter.io',
        'https://freighter.io',
      ];

      for (const scheme of supported) {
        try {
          const result = await Linking.canOpenURL(scheme);
          if (result) return true;
        } catch {
          continue;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Conectar wallet
  const connectWallet = async (): Promise<ConnectResult> => {
    try {
      // Intentar abrir Freighter via deep link
      const freighterUrl = 'freighter://connect';

      const opened = await Linking.openURL(freighterUrl);

      if (!opened) {
        // Freighter no instalado - mostrar opción de instalación
        Alert.alert(
          'Freighter no detectado',
          'Para conectar, instala Freighter del store o usa el navegador.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return { success: false, error: 'Freighter not installed' };
      }

      // The mobile return-flow from Freighter is not implemented yet, so we
      // must NOT pretend the wallet connected (no mock addresses/balances).
      return {
        success: false,
        error:
          'Mobile wallet return-flow not implemented yet — use the web app with the Freighter extension.',
      };
    } catch (err) {
      console.error('Error connecting wallet:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Refresh wallet state after Freighter connection
  // NOT IMPLEMENTED: explicit stub so no mock wallet state is ever
  // presented as a real connection.
  const refreshWalletAfterConnect = async (): Promise<void> => {
    console.warn('refreshWalletAfterConnect: mobile return-flow not implemented');
  };

  // Cambiar de red
  const switchNetwork = async (network: 'testnet' | 'mainnet'): Promise<boolean> => {
    try {
      // En una implementación completa, cambiaríamos la red en Freighter
      setWallet(prev => ({ ...prev, network }));
      return true;
    } catch {
      return false;
    }
  };

  // Obtener balance
  const refreshBalance = async (): Promise<void> => {
    // NOT IMPLEMENTED: no mock balances. Balance stays as-is until a real
    // Horizon/Soroban query is wired for mobile.
    console.warn('refreshBalance: mobile balance query not implemented');
  };

  // Desconectar
  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      isFreighterInstalled: false,
      network: 'testnet',
      balance: '0.00',
    });
  }, []);

  return {
    ...wallet,
    connectWallet,
    switchNetwork,
    refreshBalance,
    disconnect,
    isFreighterInstalled: wallet.isFreighterInstalled,
    isConnected: wallet.isConnected,
  };
}

export default useFreighter;