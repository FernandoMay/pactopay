import { useState } from "react";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

interface TxFeedbackProps {
  status: "idle" | "signing" | "submitting" | "success" | "error";
  txHash?: string;
  error?: string;
  onDismiss?: () => void;
}

export function TxFeedback({ status, txHash, error, onDismiss }: TxFeedbackProps) {
  if (status === "idle") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`rounded-xl shadow-xl border p-4 ${
        status === "success" ? "bg-secondary-container border-secondary/30" :
        status === "error" ? "bg-error-container border-error/30" :
        "bg-surface-container-lowest border-outline-variant/30"
      }`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            status === "signing" || status === "submitting" ? "bg-surface-container" :
            status === "success" ? "bg-secondary text-on-secondary" :
            "bg-error text-on-error"
          }`}>
            {status === "signing" || status === "submitting" ? (
              <span className="material-symbols-outlined text-[22px] text-primary animate-spin">progress_activity</span>
            ) : status === "success" ? (
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            ) : (
              <span className="material-symbols-outlined text-[22px]">error</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-title-md text-title-md font-semibold text-on-surface">
              {status === "signing" && "Firmando transacción..."}
              {status === "submitting" && "Enviando a la red Stellar..."}
              {status === "success" && "Transacción confirmada"}
              {status === "error" && "Error en la transacción"}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {status === "signing" && "Aprobá la transacción en tu billetera Freighter"}
              {status === "submitting" && "Esperando confirmación en la red (3-5 segundos)"}
              {status === "success" && txHash && (
                <a
                  href={`${EXPLORER_BASE}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                >
                  Ver en Stellar Explorer
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
              {status === "error" && error}
            </p>
          </div>

          {/* Dismiss */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Progress bar for signing/submitting */}
        {(status === "signing" || status === "submitting") && (
          <div className="mt-3 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: status === "signing" ? "40%" : "80%" }} />
          </div>
        )}

        {/* Tx hash display for success */}
        {status === "success" && txHash && (
          <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest/50 font-mono text-xs text-on-surface-variant truncate">
            TX: {txHash}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for managing tx feedback state
export function useTxFeedback() {
  const [txState, setTxState] = useState<{
    status: "idle" | "signing" | "submitting" | "success" | "error";
    txHash?: string;
    error?: string;
  }>({ status: "idle" });

  const startSigning = () => setTxState({ status: "signing" });
  const startSubmitting = () => setTxState({ status: "submitting" });
  const succeed = (hash: string) => setTxState({ status: "success", txHash: hash });
  const fail = (err: string) => setTxState({ status: "error", error: err });
  const reset = () => setTxState({ status: "idle" });

  return { txState, startSigning, startSubmitting, succeed, fail, reset };
}
