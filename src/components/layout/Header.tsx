import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../wallet/WalletProvider";
import { truncateAddress } from "../../lib/format";

const NAV_ITEMS = [
  { path: "/crear-factura", label: "Crear Factura" },
  { path: "/pagar-custodia", label: "Pagar Custodia" },
  { path: "/panel-de-control", label: "Panel de Control" },
  { path: "/cumplimiento-fiscal", label: "Cumplimiento & Fiscal" },
];

export function Header() {
  const location = useLocation();
  const { wallet, isConnected, disconnect, isFreighterInstalled, error, connect, isConnecting } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const isMainnet = wallet?.network === "mainnet";
  const networkLabel = wallet?.network === "testnet" ? "Testnet" : wallet?.network === "mainnet" ? "Mainnet" : "Testnet";

  const handleConnect = async () => {
    await connect();
  };

  return (
    <>
      {/* Mainnet warning banner */}
      {isConnected && isMainnet && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-error text-on-error px-4 py-2 text-center font-label-md text-label-md font-semibold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Estás en Mainnet — esta dApp opera en Testnet. Cambiá a Testnet en Freighter para usar PactoPay.
        </div>
      )}

      <header className={`fixed left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] ${isConnected && isMainnet ? "top-10" : "top-0"}`}>
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md">
          {/* Logo + Network Badge */}
          <div className="flex items-center gap-space-md">
            <Link to="/" className="flex items-center gap-space-sm">
              <img
                alt="PactoPay logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1X_eUZgX7WiSJtLVI3GfoOiRXgbqQ6Ghy5weT5IoSY5IY7POSJBJdhiESVDPIzx97ZaMDZ0Q2IT_0o_0cxMgWV1cqXu6Ds3EFEoC6KfI4vt-vdKiDa_XGqVQ88-zLJQsCTfj35zrIfGbH69XeAH65wcoEKaIYUn8t_lF58pJbbeFEhzeeNT48VRL5hVbkoJy-9FNUxSfDPTpXST5i55U85SpoQkT52WrV6cMrWiH8fRBsLt7R3QbCBrQWc"
              />
              <span className="font-title-lg text-title-lg tracking-tight text-primary font-bold">
                PactoPay
              </span>
            </Link>
            <div className={`hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full font-label-sm text-label-sm ${isMainnet ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'}`}>
              <span className={`w-2 h-2 rounded-full ${isMainnet ? 'bg-error' : 'bg-secondary'} inline-block`}></span>
              <span>Red Stellar ({networkLabel})</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-space-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    isActive
                      ? "transition-colors bg-surface-container text-primary font-bold rounded-lg px-3 py-2"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors font-label-lg text-label-lg"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet + Avatar */}
          <div className="flex items-center gap-space-sm">
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:bg-secondary-container/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    account_balance_wallet
                  </span>
                  <span className="hidden sm:inline font-mono text-sm">
                    {truncateAddress(wallet?.address || "", 4)}
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
                    <div className="p-3 border-b border-outline-variant/20">
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Conectado como</p>
                      <p className="font-mono text-sm text-on-surface font-semibold truncate">
                        {wallet?.address}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-2 h-2 rounded-full ${isMainnet ? 'bg-error' : 'bg-secondary'}`}></span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{networkLabel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowDropdown(false);
                      }}
                      className="w-full px-3 py-2.5 text-left font-label-lg text-label-lg text-error hover:bg-error-container/30 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Desconectar
                    </button>
                  </div>
                )}
              </div>
            ) : !isFreighterInstalled ? (
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-tertiary text-on-tertiary font-label-lg text-label-lg font-semibold hover:bg-tertiary/90 transition-colors"
                title="Necesitás la extensión de Freighter para conectar tu billetera Stellar"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                <span className="hidden sm:inline">Instalar Freighter</span>
              </a>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => handleConnect()}
                  className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:bg-surface-container-low shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors disabled:opacity-50"
                  disabled={isConnecting}
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    account_balance_wallet
                  </span>
                  <span className="hidden sm:inline">{isConnecting ? "Conectando..." : "Conectar Billetera"}</span>
                </button>
                {error && (
                  <span className="hidden sm:block text-[11px] text-error max-w-[220px] text-right leading-tight">
                    {error}
                  </span>
                )}
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}