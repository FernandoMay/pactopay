import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatLatamCurrency, truncateAddress } from "../lib/format";
import {
  escrowClient,
  EXPLORER_CONTRACT_URL,
  ESCROW_CONTRACT_ADDRESS,
  getSACBalance,
  type Escrow,
  type EscrowStatus,
  type MilestoneStatus,
} from "../lib/contract";
import { useWallet } from "../components/wallet/WalletProvider";
import { TxFeedback, useTxFeedback } from "../components/ui/TxFeedback";

const STATUS_LABELS: Record<EscrowStatus, string> = {
  created: "Creada — pendiente de depósito",
  funded: "Fondos en custodia",
  partial: "Liberación parcial",
  completed: "Completada",
  disputed: "En disputa",
  refunded: "Reembolsada",
};

const MILESTONE_LABELS: Record<MilestoneStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  released: "Liberado",
  disputed: "En disputa",
};

function formatEscrowDate(unixSeconds: number): string {
  if (!unixSeconds || unixSeconds <= 0) return "Fecha on-chain no disponible";
  try {
    return new Date(unixSeconds * 1000).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Fecha on-chain no disponible";
  }
}

export function PagarCustodia() {
  const { escrowId: routeEscrowId } = useParams<{ escrowId: string }>();
  const { isConnected, wallet, connect, isConnecting } = useWallet();
  const [escrowIdInput, setEscrowIdInput] = useState(routeEscrowId ?? "");
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [depositing, setDepositing] = useState(false);
  const [deposited, setDeposited] = useState(false);
  // Deposit gate: undefined = not checked yet, null = no trustline/RPC fail.
  const [sacBalance, setSacBalance] = useState<number | null | undefined>(undefined);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const { txState, startSigning, startSubmitting, succeed, fail, reset } = useTxFeedback();

  const loadEscrow = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) {
        setLoadError("Ingresá el ID del escrow (por ejemplo ESC_0) para cargarlo desde testnet.");
        return;
      }
      if (!isConnected || !wallet) {
        setLoadError("Conectá tu billetera Freighter para leer la custodia desde testnet.");
        return;
      }
      setLoading(true);
      setLoadError(null);
      setDeposited(false);
      setSacBalance(undefined);
      try {
        const data = await escrowClient.getEscrow(trimmed, wallet.address);
        if (!data) {
          setEscrow(null);
          setLoadError(`No se encontró el escrow "${trimmed}" en el contrato de testnet.`);
        } else {
          setEscrow(data);
          setDeposited(data.status === "funded" || data.status === "partial" || data.status === "completed");
        }
      } catch (err) {
        setEscrow(null);
        setLoadError(err instanceof Error ? err.message : "No se pudo leer el escrow desde testnet.");
      } finally {
        setLoading(false);
      }
    },
    [isConnected, wallet]
  );

  // Auto-load when the route carries an escrow ID and the wallet is ready.
  useEffect(() => {
    if (routeEscrowId && isConnected && wallet && !escrow && !loading && !loadError) {
      void loadEscrow(routeEscrowId);
    }
  }, [routeEscrowId, isConnected, wallet, escrow, loading, loadError, loadEscrow]);

  // Probe the payer SAC balance for the escrow token (real read, no mocks).
  // `null` means no trustline/RPC fail; the deposit stays disabled in that case.
  useEffect(() => {
    if (!escrow || !wallet || escrow.status !== "created") return;
    let cancelled = false;
    setCheckingBalance(true);
    getSACBalance(escrow.token, wallet.address, wallet.address)
      .then((bal) => {
        if (!cancelled) setSacBalance(bal);
      })
      .catch(() => {
        if (!cancelled) setSacBalance(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingBalance(false);
      });
    return () => {
      cancelled = true;
    };
  }, [escrow, wallet]);

  const requiredAmount = escrow
    ? escrow.remainingAmount > 0
      ? escrow.remainingAmount
      : escrow.totalAmount
    : 0;
  const balanceInsufficient =
    sacBalance !== undefined && sacBalance !== null && sacBalance < requiredAmount;
  const balanceMissing = sacBalance === null;

  const handleDeposit = async () => {
    if (!escrow) return;
    if (!isConnected || !wallet) {
      await connect();
      fail("Conectá tu billetera Freighter para firmar el depósito en testnet.");
      return;
    }
    // Only Created escrows can be funded; every other status has a next step.
    if (escrow.status !== "created") {
      fail(
        escrow.status === "funded"
          ? "Esta custodia ya está fondeada: el siguiente paso es aprobar en el Panel de Control."
          : "Esta custodia ya no admite depósitos: revisá su estado en el Panel de Control."
      );
      return;
    }
    // Fresh funding gate with the escrow token (real read, no mocks).
    try {
      const fresh = await getSACBalance(escrow.token, wallet.address, wallet.address);
      setSacBalance(fresh);
      const needed = escrow.remainingAmount > 0 ? escrow.remainingAmount : escrow.totalAmount;
      if (fresh === null) {
        fail("Sin trustline/saldo del token de esta custodia: fondeá la cuenta primero. Sin balance real el depósito va a fallar.");
        return;
      }
      if (fresh < needed) {
        fail(`Saldo insuficiente del token: tenés ${fresh.toFixed(2)} y el depósito necesita ${needed.toFixed(2)}. Fondeá la cuenta primero.`);
        return;
      }
    } catch {
      fail("No se pudo verificar el saldo del token en testnet. Intentá de nuevo.");
      return;
    }
    setDepositing(true);
    startSigning();
    try {
      const result = await escrowClient.fundEscrow(escrow.id, wallet.address, escrow.totalAmount);
      if (!result.success) {
        throw new Error(result.error || "El depósito falló en testnet.");
      }
      startSubmitting();
      // buildSignAndSubmit only reports success with a real on-chain hash.
      if (!result.hash) {
        throw new Error("El depósito se envió pero testnet no devolvió hash. Revisá tu billetera.");
      }
      succeed(result.hash);
      setDeposited(true);
      // Refresh on-chain state after funding.
      try {
        const refreshed = await escrowClient.getEscrow(escrow.id, wallet.address);
        if (refreshed) setEscrow(refreshed);
      } catch {
        // Keep the previous state if the refresh read fails.
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "El depósito falló en testnet.";
      fail(message);
    } finally {
      setDepositing(false);
    }
  };

  const fundedBadge = escrow
    ? deposited
      ? "Depósito Confirmado"
      : "Pendiente de Depósito"
    : "Custodia Testnet";

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

          {/* Escrow lookup (manual entry when no :escrowId route) */}
          {!routeEscrowId && (
            <div className="w-full max-w-[640px] mb-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <label className="font-label-lg text-label-lg text-on-surface font-semibold">
                Cargar custodia desde Testnet
              </label>
              <div className="flex flex-col sm:flex-row gap-space-xs">
                <input
                  className="flex-1 h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-mono font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                  placeholder="ESC_0"
                  spellCheck={false}
                  value={escrowIdInput}
                  onChange={(e) => setEscrowIdInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => void loadEscrow(escrowIdInput)}
                  disabled={loading}
                  className="px-4 h-11 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-colors disabled:opacity-60"
                >
                  {loading ? "Cargando..." : "Cargar escrow"}
                </button>
              </div>
              {!isConnected && (
                <button
                  type="button"
                  onClick={() => void connect()}
                  disabled={isConnecting}
                  className="self-start px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md font-semibold"
                >
                  {isConnecting ? "Conectando..." : "Conectar Freighter para leer testnet"}
                </button>
              )}
              {loadError && (
                <p className="font-body-sm text-body-sm text-error flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {loadError}
                </p>
              )}
            </div>
          )}

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
                <span>{fundedBadge}</span>
              </div>
            </div>

            {!escrow ? (
              <div className="px-space-lg sm:px-space-xl py-space-xl flex flex-col items-center text-center gap-space-sm">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Leyendo la custodia desde el contrato de testnet...
                    </p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant">search</span>
                    <p className="font-title-md text-title-md text-on-surface font-semibold">
                      {routeEscrowId
                        ? "Conectá tu billetera para cargar esta custodia"
                        : "Todavía no hay custodia cargada"}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                      {routeEscrowId
                        ? `El escrow "${routeEscrowId}" se lee en vivo desde el contrato de testnet una vez conectada la billetera.`
                        : "Ingresá el ID del escrow arriba para ver sus datos reales on-chain."}
                    </p>
                    {!isConnected && (
                      <button
                        type="button"
                        onClick={() => void connect()}
                        disabled={isConnecting}
                        className="mt-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-colors"
                      >
                        {isConnecting ? "Conectando..." : "Conectar Freighter"}
                      </button>
                    )}
                    {routeEscrowId && isConnected && loadError && (
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-body-sm text-body-sm text-error">{loadError}</p>
                        <button
                          type="button"
                          onClick={() => void loadEscrow(routeEscrowId)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md font-bold"
                        >
                          {loading ? "Reintentando..." : "Reintentar lectura"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
            {/* Invoice Header */}
            <div className="px-space-lg sm:px-space-xl pt-space-lg pb-space-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-0.5">
                    Comprobante de Pago en Garantía
                  </span>
                  <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                    CUSTODIA #{escrow.id}
                  </h1>
                </div>
                <div className="sm:text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Creada en Testnet</span>
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">{formatEscrowDate(escrow.createdAt)}</span>
                </div>
              </div>

              {/* Contractor Profile */}
              <div className="mt-space-md p-space-md rounded-lg bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold font-title-md text-title-md shrink-0">
                    {escrow.contractor.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-title-md font-semibold text-on-surface font-mono">
                        {truncateAddress(escrow.contractor, 6)}
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">
                      Contratista on-chain • Pagador: {truncateAddress(escrow.payer, 6)}
                    </span>
                  </div>
                </div>
                <div className="flex sm:flex-col sm:items-end items-center gap-1 text-on-surface-variant font-label-md text-label-md">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-medium text-on-surface">Estado</span>
                  <span>{STATUS_LABELS[escrow.status]}</span>
                </div>
              </div>
            </div>

            {/* Amount Block */}
            <div className="px-space-lg sm:px-space-xl py-space-lg bg-surface-container-lowest flex flex-col items-center justify-center text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold mb-1">
                Total a Depositar en Custodia
              </span>
              <div className="flex items-baseline justify-center gap-space-xs text-on-surface">
                <span className="font-amount-display text-amount-display font-extrabold tracking-tight text-primary">
                  {formatLatamCurrency(escrow.totalAmount).replace(" USDC", "")}
                </span>
                <span className="font-title-lg text-title-lg font-bold text-on-surface-variant">USDC</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Liberado: {formatLatamCurrency(escrow.releasedAmount)} • Restante: {formatLatamCurrency(escrow.remainingAmount)}</span>
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
                    Custodia {escrow.id} en Stellar Testnet
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Pagador <span className="font-mono">{truncateAddress(escrow.payer, 8)}</span> → contratista{" "}
                    <span className="font-mono">{truncateAddress(escrow.contractor, 8)}</span>. Los fondos se
                    resguardan en el contrato inteligente hasta aprobar y liberar cada hito.
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
                    Hitos de Pago Protegidos (on-chain)
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    {escrow.milestones.length} {escrow.milestones.length === 1 ? "Hito" : "Hitos"}
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {escrow.milestones.length === 0 && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md rounded-lg bg-surface-container-low">
                      Esta custodia aún no tiene hitos registrados en el contrato.
                    </p>
                  )}
                  {escrow.milestones.map((m) => (
                    <div key={m.id} className="p-space-md rounded-lg bg-surface-container-lowest shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-start justify-between gap-space-sm transition-all hover:bg-surface-container-low">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed font-bold font-label-sm text-label-sm flex items-center justify-center shrink-0 mt-0.5">
                          {m.id}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-semibold text-on-surface">{m.description}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Estado: {MILESTONE_LABELS[m.status]}
                          </span>
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
                      {isConnected && wallet ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : "Conecta para continuar"}
                    </span>
                  </div>
                </div>
                {!isConnected && (
                  <button
                    type="button"
                    onClick={() => void connect()}
                    disabled={isConnecting}
                    className="px-3 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold"
                  >
                    {isConnecting ? "Conectando..." : "Conectar Freighter"}
                  </button>
                )}
                <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:items-end items-center font-label-md text-label-md">
                  <span className="text-on-surface-variant">Saldo Disponible:</span>
                  <span className="font-title-md text-title-md font-bold text-secondary">
                    {isConnected ? `$ ${wallet?.balance?.toFixed(2) || "0.00"} USDC` : "—"}
                  </span>
                </div>
              </div>

              {/* CTA: gated by on-chain status + real token balance */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                {escrow.status !== "created" ? (
                  <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-1">
                    {escrow.status === "funded" && (
                      <>
                        <span className="font-title-md text-title-md font-bold text-on-surface">
                          Custodia fondeada: el siguiente paso es aprobar en el Panel
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Los fondos ya están en custodia. Aprobá cada hito desde el Panel de Control para liberarlos.
                        </span>
                        <Link
                          className="font-label-md text-label-md text-primary font-semibold hover:underline"
                          to="/panel-de-control"
                        >
                          Ir al Panel de Control
                        </Link>
                      </>
                    )}
                    {(escrow.status === "partial" || escrow.status === "completed") && (
                      <>
                        <span className="font-title-md text-title-md font-bold text-secondary">
                          {escrow.status === "completed" ? "Custodia completada" : "Liberación parcial en curso"}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {escrow.status === "completed"
                            ? "Todos los fondos ya fueron liberados. No hace falta ningún depósito más."
                            : "Parte de los fondos ya se liberó. Seguí la liberación restante desde el Panel de Control."}
                        </span>
                        <Link
                          className="font-label-md text-label-md text-primary font-semibold hover:underline"
                          to="/panel-de-control"
                        >
                          Ver estado en el Panel
                        </Link>
                      </>
                    )}
                    {escrow.status === "disputed" && (
                      <span className="font-body-md text-body-md text-on-surface">
                        Custodia en disputa: resolvé el siguiente paso desde el Panel de Control.
                      </span>
                    )}
                    {escrow.status === "refunded" && (
                      <span className="font-body-md text-body-md text-on-surface">
                        Custodia reembolsada al pagador: no admite más depósitos.
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      {checkingBalance ? (
                        <span>Leyendo tu saldo del token en testnet...</span>
                      ) : balanceMissing ? (
                        <span className="text-error font-semibold">
                          Sin trustline/saldo del token de esta custodia: fondeá la cuenta primero.
                        </span>
                      ) : sacBalance !== undefined && sacBalance !== null ? (
                        <span>
                          Tu saldo del token: <strong className="text-on-surface">{sacBalance.toFixed(2)}</strong> (necesitás {requiredAmount.toFixed(2)})
                          {balanceInsufficient && (
                            <strong className="text-error"> — saldo insuficiente, fondeá la cuenta primero.</strong>
                          )}
                        </span>
                      ) : (
                        <span>Verificando tu saldo del token para habilitar el depósito...</span>
                      )}
                    </div>
                    <button
                      onClick={() => void handleDeposit()}
                      disabled={deposited || depositing || checkingBalance || balanceMissing || balanceInsufficient}
                      className={`w-full py-4 px-space-lg rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm transition-all active:scale-[0.99] ${
                        deposited
                          ? "bg-surface-container-high text-on-surface-variant cursor-default"
                          : "bg-secondary hover:bg-on-secondary-container text-on-secondary shadow-[0_10px_20px_-5px_rgba(0,108,74,0.3)] cursor-pointer disabled:opacity-60"
                      }`}
                    >
                      {depositing ? (
                        <>
                          <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                          <span>Firmando depósito en Freighter...</span>
                        </>
                      ) : deposited ? (
                        <>
                          <span className="material-symbols-outlined text-[24px] text-secondary">check_circle</span>
                          <span>Fondos Depositados en Custodia</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[24px]">shield</span>
                          <span>Depositar {formatLatamCurrency(escrow.totalAmount)} en Custodia Protegida</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* Success Alert */}
                {deposited && txState.txHash && (
                  <div className="mt-space-sm p-space-md rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-space-sm transition-all duration-300">
                    <span className="material-symbols-outlined text-[22px] text-secondary shrink-0">task_alt</span>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md font-bold">¡Depósito en Custodia Confirmado con Éxito!</span>
                      <span className="font-body-sm text-body-sm mt-0.5">
                        Los {formatLatamCurrency(escrow.totalAmount)} quedaron asegurados en el escrow {escrow.id} de testnet.
                      </span>
                    </div>
                  </div>
                )}

                <p className="font-body-sm text-body-sm text-center text-on-surface-variant mt-1 leading-relaxed">
                  Al hacer clic, firmás el depósito con Freighter. El dinero{" "}
                  <strong>no se transferirá al contratista hoy</strong>; quedará resguardado en Stellar
                  hasta que verifiques cada entrega y apruebes la liberación.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-space-lg sm:px-space-xl py-space-md bg-surface-container-low flex flex-col gap-space-xs text-center text-on-surface-variant font-label-md text-label-md">
              <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-1">
                <div className="flex items-center gap-1 font-mono text-[12px]">
                  <span className="text-on-surface-variant font-sans">Contrato:</span>
                  <span className="text-on-surface font-semibold">{truncateAddress(ESCROW_CONTRACT_ADDRESS, 4)}</span>
                </div>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <a className="text-primary hover:underline inline-flex items-center gap-0.5" href={EXPLORER_CONTRACT_URL} rel="noopener noreferrer" target="_blank">
                  <span>Ver contrato en Stellar Expert</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/panel-de-control">
                  Soporte y Mediación
                </Link>
              </div>
              <p className="text-[11px] leading-normal text-on-surface-variant/80">
                Custodia {escrow.id} leída en vivo desde el contrato de testnet. Firmá cada operación
                con tu billetera Freighter.
              </p>
            </div>
              </>
            )}
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

      {/* Transaction Feedback Toast (real hash) */}
      <TxFeedback
        status={txState.status}
        txHash={txState.txHash}
        error={txState.error}
        onDismiss={reset}
      />
    </div>
  );
}
