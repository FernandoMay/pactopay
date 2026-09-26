import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatLatamCurrency, truncateAddress } from "../lib/format";
import {
  escrowClient,
  explorerTxUrl,
  EXPLORER_CONTRACT_URL,
  getSACBalance,
  type ContractResult,
  type Escrow,
  type EscrowStatus,
  type Milestone,
  type MilestoneStatus,
} from "../lib/contract";
import { useWallet } from "../components/wallet/WalletProvider";
import { TxFeedback, useTxFeedback } from "../components/ui/TxFeedback";

const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  created: "Creada",
  funded: "Fondos en custodia",
  partial: "Liberación parcial",
  completed: "Completada",
  disputed: "En disputa",
  refunded: "Reembolsada",
};

const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  released: "Liberado",
  disputed: "En disputa",
};

interface TxRecord {
  label: string;
  hash: string;
}

export function PanelControl() {
  const { wallet, isConnected, isConnecting, connect } = useWallet();
  const { txState, startSigning, startSubmitting, succeed, fail, reset } = useTxFeedback();

  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [txRecords, setTxRecords] = useState<TxRecord[]>([]);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [pendingRelease, setPendingRelease] = useState<Milestone | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const walletAddress = wallet?.address ?? null;
  const selected: Escrow | null = escrows.find((e) => e.id === selectedId) ?? null;

  const refreshEscrows = useCallback(async () => {
    if (!walletAddress) return;
    const list = await escrowClient.getEscrowsForAddress(walletAddress);
    setEscrows(list);
  }, [walletAddress]);

  // Load real on-chain escrows whenever the wallet connects.
  useEffect(() => {
    if (!isConnected || !walletAddress) {
      setEscrows([]);
      setSelectedId(null);
      return;
    }
    let cancelled = false;
    setLoadingList(true);
    setListError(null);
    escrowClient
      .getEscrowsForAddress(walletAddress)
      .then((list) => {
        if (cancelled) return;
        setEscrows(list);
        setSelectedId((prev) => prev ?? list[0]?.id ?? null);
        if (list.length === 0) {
          setListError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setListError(err instanceof Error ? err.message : "No se pudieron leer las custodias desde testnet.");
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isConnected, walletAddress]);

  const pushTx = (label: string, hash: string) => {
    setTxRecords((prev) => [...prev, { label, hash }]);
  };

  const runWrite = async (
    key: string,
    label: string,
    call: () => Promise<ContractResult>
  ): Promise<boolean> => {
    if (!walletAddress) {
      fail("Conectá tu billetera Freighter para firmar en testnet.");
      return false;
    }
    setActionKey(key);
    startSigning();
    try {
      const result = await call();
      if (!result.success) {
        throw new Error(result.error || "La transacción falló en testnet.");
      }
      if (!result.hash) {
        throw new Error("Testnet no devolvió hash para la transacción.");
      }
      pushTx(label, result.hash);
      succeed(result.hash);
      await refreshEscrows();
      return true;
    } catch (err) {
      fail(err instanceof Error ? err.message : "La transacción falló en testnet.");
      return false;
    } finally {
      setActionKey(null);
    }
  };

  const handleApprove = (milestone: Milestone) => {
    if (!selected || !walletAddress) return;
    void runWrite(`approve-${milestone.id}`, `Aprobación hito ${milestone.id} (${selected.id})`, () =>
      escrowClient.approveMilestone(selected.id, milestone.id, walletAddress)
    );
  };

  const handleReleaseDirect = (milestone: Milestone) => {
    if (!selected || !walletAddress) return;
    const escrow = selected;
    const contractorShort = truncateAddress(escrow.contractor, 4);
    // Trustline gate: without it the on-chain release reverts (CLI lesson).
    void (async () => {
      const trust = await getSACBalance(escrow.token, escrow.contractor, walletAddress);
      if (trust === null) {
        fail(`El contractor (${contractorShort}) no tiene trustline al token: el release on-chain va a revertir. Pedile que agregue el asset primero.`);
        return;
      }
      await runWrite(`release-${milestone.id}`, `Liberación hito ${milestone.id} (${escrow.id})`, () =>
        escrowClient.releaseMilestone(escrow.id, milestone.id, walletAddress)
      );
    })();
  };

  const handleDispute = (milestone: Milestone) => {
    if (!selected || !walletAddress) return;
    void runWrite(`dispute-${milestone.id}`, `Disputa hito ${milestone.id} (${selected.id})`, () =>
      escrowClient.openDispute(selected.id, milestone.id, walletAddress)
    );
  };

  const handleRefund = () => {
    if (!selected || !walletAddress) return;
    void runWrite(`refund-${selected.id}`, `Reembolso (${selected.id})`, () =>
      escrowClient.refundEscrow(selected.id, walletAddress)
    );
  };

  // "Solicitar Cambios" opens a real on-chain dispute on the first actionable milestone.
  const handleRequestChanges = () => {
    if (!selected || !walletAddress) return;
    const target = selected.milestones.find((m) => m.status === "pending" || m.status === "approved");
    if (!target) {
      fail("No hay hitos pendientes o aprobados para disputar en esta custodia.");
      return;
    }
    handleDispute(target);
  };

  const openReleaseModal = (milestone: Milestone) => {
    setPendingRelease(milestone);
    setShowReleaseModal(true);
  };

  // Modal drives the real two-step flow: approve (if needed) then release.
  const handleReleaseConfirm = async () => {
    if (!selected || !pendingRelease || !walletAddress) return;
    // Trustline gate before any write: without it the release reverts on-chain.
    const contractorShort = truncateAddress(selected.contractor, 4);
    const trust = await getSACBalance(selected.token, selected.contractor, walletAddress);
    if (trust === null) {
      fail(`El contractor (${contractorShort}) no tiene trustline al token: el release on-chain va a revertir. Pedile que agregue el asset primero.`);
      return;
    }
    setReleasing(true);
    startSigning();
    try {
      if (pendingRelease.status !== "approved") {
        const approval = await escrowClient.approveMilestone(selected.id, pendingRelease.id, walletAddress);
        if (!approval.success) {
          throw new Error(approval.error || "Falló la aprobación en testnet.");
        }
        if (approval.hash) {
          pushTx(`Aprobación hito ${pendingRelease.id} (${selected.id})`, approval.hash);
        }
      }
      startSubmitting();
      const release = await escrowClient.releaseMilestone(selected.id, pendingRelease.id, walletAddress);
      if (!release.success) {
        throw new Error(release.error || "Falló la liberación en testnet.");
      }
      if (!release.hash) {
        throw new Error("Testnet no devolvió hash para la liberación.");
      }
      pushTx(`Liberación hito ${pendingRelease.id} (${selected.id})`, release.hash);
      succeed(release.hash);
      setShowReleaseModal(false);
      setPendingRelease(null);
      await refreshEscrows();
    } catch (err) {
      fail(err instanceof Error ? err.message : "La liberación falló en testnet.");
    } finally {
      setReleasing(false);
    }
  };

  const handleShareState = () => {
    if (!selected) return;
    navigator.clipboard.writeText(`${window.location.origin}/pagar/${selected.id}`).then(() => {
      setLinkCopied(true);
    });
  };

  const selectEscrow = (id: string) => {
    setSelectedId(id);
    setLinkCopied(false);
  };

  // First milestone that can still be released (approved first, then pending).
  const releasable: Milestone | null =
    selected?.milestones.find((m) => m.status === "approved") ??
    selected?.milestones.find((m) => m.status === "pending") ??
    null;
  const allReleased =
    !!selected && selected.milestones.length > 0 && selected.milestones.every((m) => m.status === "released");
  const doneCount = selected?.milestones.filter((m) => m.status === "approved" || m.status === "released").length ?? 0;

  if (!isConnected || !wallet) {
    return (
      <div className="w-full pt-0 bg-surface flex-1">
        <div className="max-w-7xl mx-auto px-gutter py-margin">
          <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col items-center text-center gap-space-md max-w-xl mx-auto">
            <span className="material-symbols-outlined text-primary text-[40px]">account_balance_wallet</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Gestión de Custodia Activa
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Conectá tu billetera Freighter para listar tus custodias reales del contrato de testnet
              y firmar aprobaciones, liberaciones o disputas.
            </p>
            <button
              type="button"
              onClick={() => void connect()}
              disabled={isConnecting}
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold transition-colors"
            >
              {isConnecting ? "Conectando..." : "Conectar Freighter"}
            </button>
          </div>
        </div>
        <TxFeedback status={txState.status} txHash={txState.txHash} error={txState.error} onDismiss={reset} />
      </div>
    );
  }

  return (
    <div className="w-full pt-0 bg-surface flex-1">
      <div className="max-w-7xl mx-auto px-gutter py-margin">
        <div className="flex flex-col w-full">
          {/* Assurance Banner */}
          <div className="mb-space-lg rounded-xl bg-surface-container p-space-md shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[20px]">format_image_left</span>
              </div>
              <div>
                <p className="font-body-md text-body-md text-on-surface font-semibold">Garantía Activa de Custodia PactoPay</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Custodias leídas en vivo desde el contrato de Stellar Testnet para {truncateAddress(wallet.address, 6)}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Escrow: <span className="font-mono text-primary font-bold">{selected ? `#${selected.id}` : "—"}</span>
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  FONDOS PROTEGIDOS EN CUSTODIA
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  {selected ? `Escrow #${selected.id} • ${ESCROW_STATUS_LABELS[selected.status]}` : "Sin custodia seleccionada"}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Gestión de Custodia Activa
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex flex-wrap items-center gap-2">
                {selected ? (
                  <>
                    <span className="font-medium text-on-surface font-mono">Pagador: {truncateAddress(selected.payer, 6)}</span>
                    <span>•</span>
                    <span>Contratista: <strong className="text-on-surface font-semibold font-mono">{truncateAddress(selected.contractor, 6)}</strong></span>
                  </>
                ) : (
                  <span>Tus custodias on-chain aparecerán aquí.</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md text-label-md shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Descargar Factura (PDF)
              </button>
              <button
                type="button"
                onClick={handleShareState}
                disabled={!selected}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md text-label-md shadow-sm transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                {linkCopied ? "¡Enlace copiado!" : "Compartir Estado"}
              </button>
            </div>
          </div>

          {/* Escrow selector (real on-chain list) */}
          <div className="mb-space-lg rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Tus custodias en Testnet</h2>
              <button
                type="button"
                onClick={() => void refreshEscrows()}
                disabled={loadingList}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {loadingList ? "Leyendo..." : "Actualizar"}
              </button>
            </div>
            {loadingList && escrows.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                Leyendo custodias desde el contrato de testnet...
              </p>
            ) : listError ? (
              <p className="font-body-sm text-body-sm text-error">{listError}</p>
            ) : escrows.length === 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No se encontraron custodias para esta dirección en testnet.
                </p>
                <Link
                  to="/crear-factura"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Crear la primera custodia
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-space-xs">
                {escrows.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => selectEscrow(e.id)}
                    className={`px-3.5 py-2 rounded-lg font-mono font-label-md text-label-md font-bold transition-all ${
                      e.id === selectedId
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    #{e.id} • {formatLatamCurrency(e.totalAmount).replace(" USDC", "")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && (
          <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
            {/* Balance Protected */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-secondary-container/20 pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Monto Resguardado</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">verified</span> 100% Protegido
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-amount-display text-amount-display text-primary font-bold tracking-tight">{formatLatamCurrency(selected.remainingAmount).replace(" USDC", "")}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-semibold text-primary">USDC</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">lock_clock</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Total: {formatLatamCurrency(selected.totalAmount)} • Liberado: {formatLatamCurrency(selected.releasedAmount)}
                </span>
              </div>
            </div>

            {/* Contractor */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Profesional Destinatario</span>
                  <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> On-chain
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-title-md text-title-md shrink-0 shadow-sm">
                    {selected.contractor.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-title-md text-title-md text-on-surface font-bold truncate font-mono">{truncateAddress(selected.contractor, 8)}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Contratista del escrow #{selected.id}</p>
                  </div>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">military_tech</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">Pagador: {truncateAddress(selected.payer, 8)}</span>
              </div>
            </div>

            {/* Custody status */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-surface-container pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Estado de la Custodia</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">
                    Testnet
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-amount-display text-amount-display text-on-surface font-bold tracking-tight">{ESCROW_STATUS_LABELS[selected.status]}</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">schedule</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {doneCount} de {selected.milestones.length} hitos aprobados o liberados
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column: Deliverables (8) + Release Rail (4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
            {/* Left: Deliverables */}
            <div className="lg:col-span-8 flex flex-col gap-space-lg">
              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md mb-space-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Hitos del escrow #{selected.id}</h2>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Cada hito se aprueba, libera o disputa con una firma real en testnet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-container-low px-3 py-1.5 rounded-lg">
                    <span className="font-label-md text-label-md text-on-surface-variant">Progreso:</span>
                    <span className="font-label-md text-label-md font-bold text-secondary">{doneCount} de {selected.milestones.length} completados</span>
                    <div className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: selected.milestones.length > 0 ? `${(doneCount / selected.milestones.length) * 100}%` : "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Milestones (real) */}
                <div className="flex flex-col gap-space-md">
                  {selected.milestones.length === 0 && (
                    <p className="font-body-md text-body-md text-on-surface-variant p-space-md rounded-xl bg-surface">
                      Este escrow aún no tiene hitos registrados en el contrato.
                    </p>
                  )}
                  {selected.milestones.map((m, idx) => {
                    const busy = actionKey !== null;
                    return (
                    <div key={m.id} className={`rounded-xl p-space-md transition-all ${m.status === "pending" ? "bg-surface-container-lowest shadow-md ring-2 ring-primary/20" : "bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:bg-surface-container-low/70"}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold">
                            {m.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Hito {String(idx + 1).padStart(2, "0")}</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                                <span className="material-symbols-outlined text-[13px]">verified</span> {MILESTONE_STATUS_LABELS[m.status]}
                              </span>
                            </div>
                            <h3 className="font-title-md text-title-md text-on-surface font-semibold mt-1">{m.description}</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              {formatLatamCurrency(m.amount)}
                              {m.approvedBy ? ` • Aprobado por ${truncateAddress(m.approvedBy, 6)}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto shrink-0">
                          {(m.status === "pending" || m.status === "approved") && (
                            <>
                              {m.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(m)}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md font-bold shadow-sm transition-all disabled:opacity-60"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                  {actionKey === `approve-${m.id}` ? "Firmando..." : "Aprobar"}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openReleaseModal(m)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold shadow-sm transition-all disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-[16px]">lock_open</span>
                                Liberar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDispute(m)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-error hover:bg-surface-container-high font-label-md text-label-md font-semibold shadow-sm transition-all disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-[16px]">gavel</span>
                                {actionKey === `dispute-${m.id}` ? "Firmando..." : "Disputar"}
                              </button>
                            </>
                          )}
                          {m.status === "released" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Liberado
                            </span>
                          )}
                          {m.status === "disputed" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md font-bold">
                              <span className="material-symbols-outlined text-[16px]">warning</span>
                              En disputa
                            </span>
                          )}
                        </div>
                      </div>
                      {actionKey === `release-${m.id}` && (
                        <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                          Firmando liberación en Freighter...
                        </p>
                      )}
                    </div>
                    );
                  })}
                </div>

                {/* Refund (only meaningful once disputed) */}
                {selected.status === "disputed" && (
                  <button
                    type="button"
                    onClick={handleRefund}
                    disabled={actionKey !== null}
                    className="mt-space-md w-full py-3 px-space-md rounded-xl bg-error-container text-on-error-container font-title-md text-title-md font-bold shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">undo</span>
                    {actionKey === `refund-${selected.id}` ? "Firmando reembolso..." : "Reembolsar fondos al pagador (refundEscrow)"}
                  </button>
                )}
              </div>

              {/* Compliance Banner */}
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <p className="font-title-md text-title-md text-on-surface font-semibold">Respaldo Inmutable Stellar Escrow</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Operación asegurada criptográficamente con liberación directa a la billetera federada del profesional.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <a
                    href={EXPLORER_CONTRACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-surface-container font-mono text-[11px] text-primary font-semibold hover:underline"
                  >
                    {truncateAddress("CDYOE2URCONPH6XUVAJHMVAMGMKGVS3JZ7TOTXIMWWBKS573CG6XPWEV", 6)}
                  </a>
                </div>
              </div>

              {/* Signed transactions (real hashes) */}
              {txRecords.length > 0 && (
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-2">
                  <p className="font-title-md text-title-md text-on-surface font-semibold">Transacciones firmadas en Testnet</p>
                  {txRecords.map((t) => (
                    <div key={t.hash} className="flex items-center justify-between gap-2 text-body-sm font-body-sm">
                      <span className="text-on-surface-variant">{t.label}</span>
                      <a
                        href={explorerTxUrl(t.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-primary font-semibold hover:underline truncate max-w-[200px]"
                      >
                        {t.hash.slice(0, 12)}…
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Release Rail */}
            <div className="lg:col-span-4 flex flex-col gap-space-md">
              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary-container/30 to-transparent pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between pb-space-sm mb-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">lock_open</span>
                        Acción Definitiva
                      </span>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold mt-0.5">Liberación de Fondos</h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary-container/50 text-on-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">payments</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-surface-container-low p-space-md space-y-space-sm mb-space-lg">
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="text-on-surface-variant">Fondos en custodia:</span>
                      <span className="font-semibold text-on-surface">{formatLatamCurrency(selected.remainingAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        Estado:
                        <span className="material-symbols-outlined text-[14px] text-secondary" title="Estado on-chain">info</span>
                      </span>
                      <span className="font-semibold text-secondary">{ESCROW_STATUS_LABELS[selected.status]}</span>
                    </div>
                    <div className="pt-space-xs mt-space-xs bg-surface-container-highest/60 -mx-space-md px-space-md py-2 flex items-center justify-between rounded-b-lg">
                      <span className="font-title-md text-title-md font-bold text-on-surface">Total del escrow:</span>
                      <div className="text-right">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">{formatLatamCurrency(selected.totalAmount).replace(" USDC", "")}</span>
                        <span className="font-label-sm text-label-sm font-bold text-primary ml-1">USDC</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-2.5 mb-space-md">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">verified_user</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                      Al confirmar, firmás con Freighter y el dinero se transfiere al contratista{" "}
                      <strong className="font-mono">{truncateAddress(selected.contractor, 6)}</strong>. Esta operación es definitiva e irreversible.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-space-sm">
                  <button
                    onClick={() => releasable && openReleaseModal(releasable)}
                    disabled={!releasable || allReleased}
                    className={`w-full py-3.5 px-space-md rounded-xl font-title-md text-title-md font-bold shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.99] ${
                      !releasable || allReleased
                        ? "bg-surface-container-high text-on-surface-variant cursor-default"
                        : "bg-secondary hover:bg-secondary/90 text-on-secondary hover:shadow-lg"
                    }`}
                  >
                    {allReleased || !releasable ? (
                      <>
                        <span className="material-symbols-outlined text-[22px]">check_circle</span>
                        Fondos Liberados
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">lock_open</span>
                        Aprobar y Liberar hito {releasable.id}
                      </>
                    )}
                  </button>
                  {releasable && (
                    <button
                      type="button"
                      onClick={() => handleReleaseDirect(releasable)}
                      disabled={actionKey !== null || releasable.status !== "approved"}
                      title="Solo para hitos ya aprobados: libera sin el modal"
                      className="py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[17px]">bolt</span>
                      {actionKey === `release-${releasable.id}` ? "Firmando liberación..." : "Liberación directa (hito aprobado)"}
                    </button>
                  )}
                  <div className="pt-space-xs flex flex-col gap-2 text-center">
                    <button
                      type="button"
                      onClick={handleRequestChanges}
                      disabled={actionKey !== null}
                      className="py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[17px]">replay</span>
                      Solicitar Cambios o Ajustes al Profesional
                    </button>
                    <a
                      className="py-1 px-3 text-on-surface-variant hover:text-primary font-body-sm text-body-sm inline-flex items-center justify-center gap-1 transition-colors"
                      href={EXPLORER_CONTRACT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      Ver contrato en Stellar Expert
                    </a>
                  </div>
                </div>
              </div>

              {/* Liquidation Seal */}
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
                </div>
                <div>
                  <p className="font-label-lg text-label-lg font-bold text-on-surface">Liquidación en Testnet</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Cada firma se verifica en el explorer de Stellar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Timeline (real state) */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Historial de Seguridad y Movimientos</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Estado real del escrow #{selected.id} en testnet.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md font-semibold bg-secondary-container px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  {ESCROW_STATUS_LABELS[selected.status]}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
              {[
                { done: true, title: "Custodia Creada", desc: `Escrow ${selected.id} registrado en el contrato de testnet.`, badge: `Total ${formatLatamCurrency(selected.totalAmount)}` },
                { done: selected.status !== "created", title: "Fondos Depositados", desc: selected.status === "created" ? "Aún sin fondear: el pagador debe firmar fundEscrow." : `${formatLatamCurrency(selected.totalAmount)} resguardados en bóveda segura.`, badge: selected.status === "created" ? "Pendiente de depósito" : "Fondos asegurados" },
                { done: doneCount === selected.milestones.length && selected.milestones.length > 0, title: "Hitos Aprobados", desc: `${doneCount} de ${selected.milestones.length} hitos aprobados o liberados.`, badge: `${selected.milestones.length} hitos on-chain` },
                { done: selected.status === "completed", title: "Liberación Final", desc: selected.status === "completed" ? "Custodia completada en testnet." : "Esperando aprobación y liberación de los hitos restantes.", badge: "Acción en testnet", active: selected.status !== "completed" },
              ].map((s) => (
                <div key={s.title} className={`relative flex flex-col p-space-md rounded-xl ${s.active ? "bg-surface ring-2 ring-primary/30 shadow-sm" : "bg-surface-container-low"} transition-all`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-7 h-7 rounded-full ${s.done ? "bg-secondary text-on-secondary" : s.active ? "bg-primary text-on-primary animate-pulse" : "bg-surface-container-high text-on-surface-variant"} flex items-center justify-center font-bold text-[13px]`}>
                      {s.done ? <span className="material-symbols-outlined text-[16px]">check</span> : s.active ? <span className="font-bold">•</span> : <span className="material-symbols-outlined text-[16px]">pending</span>}
                    </span>
                    <span className={`font-label-sm text-label-sm ${s.done ? "text-secondary" : s.active ? "text-primary" : "text-on-surface-variant"} font-bold uppercase`}>
                      {s.done ? "Completado" : s.active ? "Paso Actual" : "Pendiente"}
                    </span>
                  </div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">{s.title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold mt-3">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-space-md">
              <Link
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
                to={`/pagar/${selected.id}`}
              >
                <span>Abrir página de pago de esta custodia</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Release Confirmation Modal (real calls) */}
      {showReleaseModal && selected && pendingRelease && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-xl relative">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-space-md shadow-sm">
              <span className="material-symbols-outlined text-[28px]">lock_open</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface">
              ¿Confirmar liberación del hito {pendingRelease.id}?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2">
              Estás a punto de {pendingRelease.status === "approved" ? "liberar" : "aprobar y liberar"}{" "}
              <strong>{formatLatamCurrency(pendingRelease.amount)}</strong> a favor del contratista{" "}
              <strong className="font-mono">{truncateAddress(selected.contractor, 6)}</strong> en Stellar Testnet.
            </p>
            <div className="my-space-md p-space-sm rounded-xl bg-surface-container-low text-body-sm font-body-sm space-y-1">
              <div className="flex justify-between text-on-surface-variant">
                <span>Escrow:</span>
                <span className="font-bold text-on-surface font-mono">#{selected.id}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Hito:</span>
                <span className="font-bold text-on-surface">{pendingRelease.description}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Red de liquidación:</span>
                <span className="font-bold text-on-surface">Stellar Soroban (Testnet)</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="font-bold">Total a transferir:</span>
                <span className="font-bold text-secondary">{formatLatamCurrency(pendingRelease.amount)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-space-sm mt-space-md">
              <button
                onClick={() => { setShowReleaseModal(false); setPendingRelease(null); }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container-high transition-colors"
              >
                Revisar más tarde
              </button>
              <button
                onClick={() => void handleReleaseConfirm()}
                disabled={releasing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {releasing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    Firmando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Sí, Liberar Fondos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <TxFeedback
        status={txState.status}
        txHash={txState.txHash}
        error={txState.error}
        onDismiss={reset}
      />
    </div>
  );
}
