import { useState } from "react";
import { useWallet } from "./WalletProvider";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect, isConnecting, error } = useWallet();
  const [step, setStep] = useState<"choose" | "connecting" | "success" | "error">("choose");

  if (!isOpen) return null;

  const handleConnect = async () => {
    setStep("connecting");
    try {
      await connect();
      setStep("success");
      setTimeout(onClose, 1500);
    } catch {
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {step === "choose" && (
          <>
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center mx-auto mb-space-md shadow-sm">
              <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface">
              Conectar Billetera
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2 mb-space-lg">
              Conecta tu billetera Stellar para crear facturas, depositar custodia y recibir pagos en USDC.
            </p>

            {/* Wallet options */}
            <div className="flex flex-col gap-space-sm">
              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/30 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#08064D] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Freighter
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Extensión de navegador para Stellar
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant ml-auto text-[20px]">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/30 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#16161A] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                    LOBSTR
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Billetera móvil y web para Stellar
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant ml-auto text-[20px]">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/30 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#2D1B69] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Vibrant
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Billetera con soporte USDC nativo
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant ml-auto text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-space-md leading-relaxed">
              Al conectar, aceptas los{" "}
              <a href="#" className="text-primary font-semibold hover:underline">
                Términos de Servicio
              </a>{" "}
              y la{" "}
              <a href="#" className="text-primary font-semibold hover:underline">
                Política de Privacidad
              </a>
              .
            </p>
          </>
        )}

        {step === "connecting" && (
          <div className="flex flex-col items-center py-space-lg">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-space-md">
              <span className="material-symbols-outlined text-[28px] text-primary animate-spin">
                progress_activity
              </span>
            </div>
            <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
              Conectando...
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Autoriza la conexión en tu billetera
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-space-lg">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-md">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
              ¡Billetera Conectada!
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Ya podés usar PactoPay
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-space-lg">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mb-space-md">
              <span className="material-symbols-outlined text-[28px]">error</span>
            </div>
            <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
              Error de Conexión
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-center">
              {error || "No se pudo conectar la billetera. Asegurate de tener Freighter instalado."}
            </p>
            <button
              onClick={() => setStep("choose")}
              className="mt-space-md px-4 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
