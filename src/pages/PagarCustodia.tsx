import { useState } from "react";
import { formatLatamCurrency } from "../lib/format";
import { useWallet } from "../components/wallet/WalletProvider";
import { TxFeedback, useTxFeedback } from "../components/ui/TxFeedback";

export function PagarCustodia() {
  const { isConnected, wallet } = useWallet();
  const [depositing, setDepositing] = useState(false);
  const [deposited, setDeposited] = useState(false);
  const { txState, startSigning, startSubmitting, succeed, fail, reset } = useTxFeedback();

  const amount = 1500;

  const handleDeposit = async () => {
    setDepositing(true);
    startSigning();

    // Simulate: signing phase (2s), then submitting (2s), then success
    setTimeout(() => {
      startSubmitting();
      setTimeout(() => {
        const mockHash = `TX${Date.now().toString(36).toUpperCase()}`;
        succeed(mockHash);
        setDepositing(false);
        setDeposited(true);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="w-full pt-0 bg-surface flex-1">
      <div className="max-w-7xl mx-auto px-gutter py-margin">
        <div className="flex flex-col w-full items-center justify-center py-space-sm sm:py-space-md">
          {/* Trust Banner */}
          <div className="w-full max-w-[640px] mb-space-sm flex items-center justify-between px-space-xs text-on-surface-variant font-label-md text-label-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
              <span>Checkout Seguro de Custodia B2B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-medium text-on-surface">Red Stellar (Testnet)</span>
            </div>
          </div>

          {/* Escrow Card */}
          <div className="w-full max-w-[640px] bg-surface-container-lowest rounded-xl shadow-[0_20px_45px_-15px_rgba(15,23,42,0.08),0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
            {/* Brand Stripe */}
            <div className="bg-surface-container-low px-space-lg sm:px-space-xl py-space-md flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md font-bold tracking-tight text-primary">PactoPay</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Custodia Programable</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
                <span>{deposited ? "Depósito Confirmado" : "Pendiente de Depósito"}</span>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="px-space-lg sm:px-space-xl pt-space-lg pb-space-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-0.5">
                    Comprobante de Pago en Garantía
                  </span>
                  <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                    FACTURA #INV-2026-0042
                  </h1>
                </div>
                <div className="sm:text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Fecha de Emisión</span>
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">24 de Octubre, 2024</span>
                </div>
              </div>

              {/* Contractor Profile */}
              <div className="mt-space-md p-space-md rounded-lg bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold font-title-md text-title-md shrink-0">
                    FM
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-title-md font-semibold text-on-surface">Fernando May</span>
                      <span className="inline-flex items-center text-secondary" title="Profesional Verificado">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">MIRAI Labs • Lima, PE</span>
                  </div>
                </div>
                <div className="flex sm:flex-col sm:items-end items-center gap-1 text-on-surface-variant font-label-md text-label-md">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-medium text-on-surface">Vencimiento Garantía</span>
                  <span>14 días tras depósito</span>
                </div>
              </div>
            </div>

            {/* Amount Block */}
            <div className="px-space-lg sm:px-space-xl py-space-lg bg-surface-container-lowest flex flex-col items-center justify-center text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold mb-1">
                Total a Depositar en Custodia
              </span>
              <div className="flex items-baseline justify-center gap-space-xs text-on-surface">
                <span className="font-headline-md text-headline-md font-bold text-on-surface-variant">$</span>
                <span className="font-amount-display text-amount-display font-extrabold tracking-tight text-primary">1.500,00</span>
                <span className="font-title-lg text-title-lg font-bold text-on-surface-variant">USDC</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Paridad garantizada 1:1 con Dólar Estadounidense (USD)</span>
              </div>
            </div>

            {/* Service Details */}
            <div className="px-space-lg sm:px-space-xl pb-space-lg flex flex-col gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold block mb-2">
                  Detalle del Servicio
                </span>
                <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                  <h2 className="font-title-md text-title-md font-semibold text-on-surface">
                    Integración de Interfaz UI/UX y Contratos Inteligentes
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Diseño responsivo de componentes de pago, integración de billetera Stellar Freighter,
                    verificación de flujo de custodia y pruebas de estabilidad en red Stellar.
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
                    Desglose de Hitos de Pago Protegidos
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">2 Hitos Programados</span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {[
                    { num: 1, title: "Arquitectura y Prototipo en Figma", desc: "Revisión técnica de flujos y validación UX", amount: 1000 },
                    { num: 2, title: "Código Frontend e Integración Final", desc: "Despliegue verificado y pase a producción", amount: 500 },
                  ].map((m) => (
                    <div key={m.num} className="p-space-md rounded-lg bg-surface-container-lowest shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-start justify-between gap-space-sm transition-all hover:bg-surface-container-low">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed font-bold font-label-sm text-label-sm flex items-center justify-center shrink-0 mt-0.5">
                          {m.num}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-semibold text-on-surface">{m.title}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{m.desc}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-title-md text-title-md font-bold text-on-surface">{formatLatamCurrency(m.amount)}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">USDC</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-space-md rounded-xl bg-surface-container text-on-surface shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-title-md text-title-md font-bold text-primary">
                      Tu pago está protegido por Custodia Programable Pacto
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Tus fondos quedan guardados de forma segura en un contrato inteligente auditado en Stellar.{" "}
                      <strong className="text-on-surface">No se entregarán al profesional</strong> hasta que revises y apruebes formalmente la entrega de cada hito.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs pt-space-xs">
                  <div className="flex items-start gap-2 bg-surface-container-lowest/80 p-space-sm rounded-lg">
                    <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">
                      Tú tienes el control total: si no cumple lo pactado, no se liberan fondos.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 bg-surface-container-lowest/80 p-space-sm rounded-lg">
                    <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">
                      Sin comisiones duplicadas ni recargos bancarios transfronterizos.
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {isConnected ? "Billetera Conectada" : "Sin Billetera"}
                      </span>
                      {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>}
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {isConnected ? `${wallet?.address.slice(0, 4)}...${wallet?.address.slice(-4)}` : "Conecta para continuar"}
                    </span>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:items-end items-center font-label-md text-label-md">
                  <span className="text-on-surface-variant">Saldo Disponible:</span>
                  <span className="font-title-md text-title-md font-bold text-secondary">
                    {isConnected ? `$ ${wallet?.balance?.toFixed(2) || "0.00"} USDC` : "—"}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <button
                  onClick={handleDeposit}
                  disabled={deposited}
                  className={`w-full py-4 px-space-lg rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm transition-all active:scale-[0.99] ${
                    deposited
                      ? "bg-surface-container-high text-on-surface-variant cursor-default"
                      : "bg-secondary hover:bg-on-secondary-container text-on-secondary shadow-[0_10px_20px_-5px_rgba(0,108,74,0.3)] cursor-pointer"
                  }`}
                >
                  {depositing ? (
                    <>
                      <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                      <span>Asegurando Fondos en Stellar...</span>
                    </>
                  ) : deposited ? (
                    <>
                      <span className="material-symbols-outlined text-[24px] text-secondary">check_circle</span>
                      <span>Fondos Depositados en Custodia</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[24px]">shield</span>
                      <span>Depositar {formatLatamCurrency(amount)} en Custodia Protegida</span>
                    </>
                  )}
                </button>

                {/* Success Alert */}
                {deposited && (
                  <div className="mt-space-sm p-space-md rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-space-sm transition-all duration-300">
                    <span className="material-symbols-outlined text-[22px] text-secondary shrink-0">task_alt</span>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md font-bold">¡Depósito en Custodia Confirmado con Éxito!</span>
                      <span className="font-body-sm text-body-sm mt-0.5">
                        Los {formatLatamCurrency(amount)} han sido asegurados en el Contrato de Custodia. Fernando May ha sido notificado para comenzar los entregables del Hito 1.
                      </span>
                    </div>
                  </div>
                )}

                <p className="font-body-sm text-body-sm text-center text-on-surface-variant mt-1 leading-relaxed">
                  Al hacer clic, autorizas el depósito seguro. El dinero{" "}
                  <strong>no se transferirá al emisor hoy</strong>; quedará resguardado en Stellar
                  hasta que verifiques cada entrega y apruebes la liberación.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-space-lg sm:px-space-xl py-space-md bg-surface-container-low flex flex-col gap-space-xs text-center text-on-surface-variant font-label-md text-label-md">
              <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-1">
                <div className="flex items-center gap-1 font-mono text-[12px]">
                  <span className="text-on-surface-variant font-sans">Contrato:</span>
                  <span className="text-on-surface font-semibold">CA7M...9K4Q</span>
                </div>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <a className="text-primary hover:underline inline-flex items-center gap-0.5" href="https://stellar.expert" rel="noopener noreferrer" target="_blank">
                  <span>Ver contrato en Stellar Expert</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                  Soporte y Mediación
                </a>
              </div>
              <p className="text-[11px] leading-normal text-on-surface-variant/80">
                Transacción ejecutada con liquidación inmediata (3-5 segundos) a través de Stellar
                Consensus Protocol. Sin comisiones bancarias SWIFT ni costos por intermediarios.
              </p>
            </div>
          </div>

          {/* Trust Seal */}
          <div className="mt-space-md flex items-center justify-center gap-space-lg text-on-surface-variant font-label-sm text-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">encrypted</span>
              <span>Criptografía Institucional Ed25519</span>
            </div>
            <span className="text-outline-variant">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">gavel</span>
              <span>Términos Legales Vinculantes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Feedback Toast */}
      <TxFeedback
        status={txState.status}
        txHash={txState.txHash}
        error={txState.error}
        onDismiss={reset}
      />
    </div>
  );
}
