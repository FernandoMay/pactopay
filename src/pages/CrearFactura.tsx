import { useState } from "react";
import {
  formatLatamCurrency,
  calculateFees,
  getLocalEstimates,
  truncateAddress,
} from "../lib/format";
import {
  escrowClient,
  sanitizeMilestoneDescription,
  isValidStellarAddress,
  explorerTxUrl,
  EXPLORER_CONTRACT_URL,
  ESCROW_CONTRACT_ADDRESS,
} from "../lib/contract";
import { useWallet } from "../components/wallet/WalletProvider";
import { TxFeedback, useTxFeedback } from "../components/ui/TxFeedback";

interface TxRecord {
  label: string;
  hash: string;
}

export function CrearFactura() {
  const { wallet, isConnected, isConnecting, connect } = useWallet();
  const { txState, startSigning, startSubmitting, succeed, fail, reset } = useTxFeedback();

  const [clientEmail, setClientEmail] = useState("finanzas@acmecorp.us");
  const [contractorAddress, setContractorAddress] = useState("");
  const [amount, setAmount] = useState(1500);
  const [concept, setConcept] = useState(
    "Integración de Interfaz UI/UX en Diseño Responsive y Conexión con Stellar SDK"
  );
  const [term, setTerm] = useState("14 días para revisar");
  const [invoiceId, setInvoiceId] = useState("INV-2026-0042");
  const [paymentLink, setPaymentLink] = useState("");
  const [createdEscrowId, setCreatedEscrowId] = useState<string | null>(null);
  const [txRecords, setTxRecords] = useState<TxRecord[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fees = calculateFees(amount);
  const localEstimates = getLocalEstimates(amount);
  const contractorValid = contractorAddress.trim() === "" ? null : isValidStellarAddress(contractorAddress);

  const mailtoHref = () => {
    const recipient = clientEmail.includes("@") ? clientEmail : "";
    const subject = encodeURIComponent(`Factura ${invoiceId} — Pago en custodia PactoPay`);
    const body = encodeURIComponent(
      `Hola,\n\nTe comparto la factura ${invoiceId} por ${formatLatamCurrency(amount)}.\n` +
        `Concepto: ${concept}\nPlazo de revisión: ${term}\n` +
        (paymentLink
          ? `Enlace de pago en custodia (Stellar Testnet): ${paymentLink}\n`
          : `El enlace de pago en custodia se genera al crear la custodia en Stellar Testnet.\n`) +
        `\nSaludos.`
    );
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleCreateEscrow = async () => {
    setFormError(null);
    setCopyFeedback(false);

    if (!isConnected || !wallet) {
      await connect();
      setFormError("Conectá tu billetera Freighter y volvé a confirmar para firmar la custodia en testnet.");
      return;
    }

    if (!isValidStellarAddress(contractorAddress)) {
      setFormError("Ingresá la dirección Stellar (G…) del contratista. El contrato la exige como dirección válida.");
      return;
    }
    const total = Math.floor(amount);
    if (!Number.isFinite(total) || total <= 0) {
      setFormError("El monto debe ser mayor a cero.");
      return;
    }
    if (concept.trim().length === 0) {
      setFormError("Describí el concepto del servicio para registrar el hito en el contrato.");
      return;
    }

    const payerAddress = wallet.address;
    setIsSubmitting(true);
    startSigning();

    try {
      // Snapshot of existing escrows so the newly created one can be
      // identified with a real on-chain read afterwards.
      let beforeIds = new Set<string>();
      try {
        const before = await escrowClient.getEscrowsForAddress(payerAddress);
        beforeIds = new Set(before.map((e) => e.id));
      } catch {
        beforeIds = new Set<string>();
      }

      const created = await escrowClient.createEscrow(
        payerAddress,
        contractorAddress.trim(),
        total
      );
      if (!created.success) {
        throw new Error(created.error || "No se pudo crear la custodia en testnet.");
      }
      const records: TxRecord[] = [];
      if (created.hash) {
        records.push({ label: "Creación de custodia", hash: created.hash });
      }

      startSubmitting();

      // Resolve the real on-chain escrow ID with a fresh read.
      const after = await escrowClient.getEscrowsForAddress(payerAddress);
      const fresh = after.find((e) => !beforeIds.has(e.id)) ?? after[after.length - 1];
      if (!fresh) {
        throw new Error(
          "La custodia se firmó pero no se pudo leer su ID en testnet. Verificá el hash de creación en el explorer."
        );
      }

      const milestoneDesc = sanitizeMilestoneDescription(concept);
      const milestone = await escrowClient.addMilestone(fresh.id, milestoneDesc, total, payerAddress);
      if (!milestone.success) {
        throw new Error(milestone.error || "Custodia creada, pero falló el alta del hito en testnet.");
      }
      if (milestone.hash) {
        records.push({ label: "Alta de hito", hash: milestone.hash });
      }

      setTxRecords(records);
      setCreatedEscrowId(fresh.id);
      setInvoiceId(`INV-${fresh.id}`);
      setPaymentLink(`https://pactopay.lat/pagar/${fresh.id}`);
      succeed(milestone.hash ?? created.hash ?? "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear la custodia en testnet.";
      setFormError(message);
      fail(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!paymentLink) {
      setFormError("Todavía no hay enlace: creá la custodia en testnet para obtener el enlace de pago real.");
      return;
    }
    navigator.clipboard.writeText(paymentLink).then(() => {
      setCopyFeedback(true);
    });
  };

  const terms = [
    { value: "7 días para revisar", label: "7 días", sub: "Proyectos ágiles" },
    { value: "14 días para revisar", label: "14 días", sub: "Recomendado", top: true },
    { value: "30 días empresas", label: "30 días", sub: "Empresas corporativas" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-gutter py-margin">
      <div className="flex flex-col w-full">
        {/* Notification Banner */}
        <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-sm px-space-md py-2.5 rounded-lg bg-surface-container-high text-on-surface text-body-sm font-body-sm shadow-sm">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-on-secondary">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
            </span>
            <span className="font-label-lg text-label-lg text-primary">Red de prueba:</span>
            <span className="text-on-surface-variant">
              Custodia real en Stellar Testnet con USDC de prueba. Cada operación deja un hash
              verificable en el explorer.
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md text-secondary font-semibold">
              Red Stellar Activa (0,00001 XLM / tx)
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="mb-space-xl relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md mb-space-sm shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
              <span>Estándar Institucional de Cobro Freelance &amp; B2B</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight mb-space-sm">
              Cobra tus trabajos al exterior con la{" "}
              <span className="text-primary font-bold">
                garantía de que siempre te van a pagar.
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-3xl mb-space-lg">
              Crea facturas internacionales en dólares digitales (USDC). Tu cliente deposita los
              fondos en custodia y se liberan automáticamente cuando entregas el trabajo, sin
              burocracia bancaria ni intermediarios costosos.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm">
              {[
                { icon: "check_circle", text: "0% comisiones sorpresa" },
                { icon: "lock", text: "Fondos 100% asegurados en custodia" },
                { icon: "electric_bolt", text: "Liberación inmediata en Stellar" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-lowest shadow-sm text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">{b.icon}</span>
                  <span className="font-label-lg text-label-lg font-semibold">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start mb-space-xl">
          {/* Form */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">
                    Crear Factura Inteligente con Custodia
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Genera un contrato de pago garantizado para tu cliente internacional
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                USDC Nativo
              </span>
            </div>

            <form className="flex flex-col gap-space-md" onSubmit={(e) => { e.preventDefault(); void handleCreateEscrow(); }}>
              {/* Client */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between font-medium">
                  <span>Correo o Dirección del Cliente</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Empresa contratante</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">mail</span>
                  <input
                    className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    placeholder="ejemplo@cliente.com"
                    type="text"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                  {clientEmail && (
                    <span className="material-symbols-outlined absolute right-3 text-secondary text-[20px]">check_circle</span>
                  )}
                </div>
              </div>

              {/* Contractor Stellar address (real on-chain requirement) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between font-medium">
                  <span>Dirección Stellar del Contratista (G…)</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Requerida por el contrato</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">account_balance_wallet</span>
                  <input
                    className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md font-mono focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    placeholder="G…"
                    type="text"
                    spellCheck={false}
                    value={contractorAddress}
                    onChange={(e) => setContractorAddress(e.target.value)}
                  />
                  {contractorValid === true && (
                    <span className="material-symbols-outlined absolute right-3 text-secondary text-[20px]">check_circle</span>
                  )}
                  {contractorValid === false && (
                    <span className="material-symbols-outlined absolute right-3 text-error text-[20px]">error</span>
                  )}
                </div>
                {contractorValid === false && (
                  <p className="font-body-sm text-body-sm text-error">
                    Dirección Stellar inválida: debe ser una clave pública válida (G…) o un contrato (C…).
                  </p>
                )}
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  El correo se usa solo para el comprobante; la custodia on-chain exige la dirección Stellar del contratista.
                </p>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between font-medium">
                  <span>Monto a Cobrar en Dólares (USDC)</span>
                  <span className="text-body-sm font-body-sm text-secondary font-medium">1 USDC = $ 1,00 USD Paridad 1:1</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-primary font-bold font-title-md text-title-md pointer-events-none">
                    <span>$</span>
                  </div>
                  <input
                    className="w-full h-12 pl-8 pr-28 rounded-lg bg-surface-container-low text-on-surface font-title-lg text-title-lg font-bold focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    min="10"
                    step="50"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  />
                  <div className="absolute right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    USDC
                  </div>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant px-1">
                  <span>
                    Equivalencia aproximada:{" "}
                    <span className="font-medium text-on-surface">
                      ~ {localEstimates.ars} ARS • ~ {localEstimates.cop} COP • ~ {localEstimates.mxn} MXN
                    </span>
                  </span>
                  <span className="text-secondary font-medium">Sin cepo ni retenciones extra</span>
                </div>
              </div>

              {/* Concept */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between font-medium">
                  <span>Concepto o Servicio Realizado</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Detalle del entregable</span>
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                  placeholder="Ej. Integración de Interfaz UI/UX y Contratos Inteligentes"
                  rows={3}
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                />
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Se registra en el contrato como símbolo de hasta 32 caracteres (mayúsculas, sin espacios).
                </p>
              </div>

              {/* Term Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between font-medium">
                  <span>Plazo de Revisión / Aprobación del Cliente</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Protección anti-demoras</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
                  {terms.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTerm(t.value)}
                      className={`px-3 py-2.5 rounded-lg text-left transition-all font-label-md text-label-md flex flex-col gap-0.5 ${
                        term === t.value
                          ? "bg-primary text-on-primary shadow-sm"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {t.top ? (
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{t.label}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-1 rounded ${term === t.value ? "bg-on-primary/20 text-on-primary" : "bg-primary/10 text-primary"}`}>Top</span>
                        </div>
                      ) : (
                        <span className="font-bold">{t.label}</span>
                      )}
                      <span className={term === t.value ? "opacity-80 font-body-sm text-body-sm" : "text-on-surface-variant font-body-sm text-body-sm"}>
                        {t.sub}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Si el cliente no solicita correcciones dentro de este plazo, la custodia se autoliquida a tu favor.
                </p>
              </div>

              {/* Fee Breakdown */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-inner">
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <span className="text-on-surface-variant">Monto total de la factura:</span>
                  <span className="font-semibold text-on-surface">{formatLatamCurrency(fees.gross)}</span>
                </div>
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Comisión de servicio estimada (0,5%, no retenida on-chain):
                    <span className="material-symbols-outlined text-[15px] text-outline" title="La comisión más baja del mercado">help</span>
                  </span>
                  <span className="font-medium text-error">-{formatLatamCurrency(fees.fee)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Tarifa de red blockchain (Stellar):</span>
                    <span className="font-medium text-secondary">Tarifa base Stellar: 0,00001 XLM</span>
                </div>
                <div className="h-px w-full bg-outline-variant/30 my-0.5"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-lg text-label-lg font-bold text-on-surface block">
                      Lo que recibes neto en tu cuenta:
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Directo en tu balance retirable
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-secondary justify-end">
                      <span className="material-symbols-outlined text-[24px]">verified</span>
                      <span className="font-headline-md text-headline-md font-bold text-secondary tracking-tight">
                        {formatLatamCurrency(fees.net)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet status + errors */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                  <span>
                    {isConnected && wallet
                      ? `Firmás como ${truncateAddress(wallet.address)} (Testnet)`
                      : "Necesitás Freighter para firmar la custodia en testnet"}
                  </span>
                </div>
                {!isConnected && (
                  <button
                    type="button"
                    onClick={() => void connect()}
                    disabled={isConnecting}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors shrink-0"
                  >
                    {isConnecting ? "Conectando..." : "Conectar Freighter"}
                  </button>
                )}
              </div>
              {formError && (
                <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Firmando custodia en Freighter...</span>
                  </>
                ) : (
                  <>
                    <span>Crear custodia real en Testnet</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </>
                )}
              </button>
              <p className="font-body-sm text-body-sm text-center text-on-surface-variant flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
                Crea el escrow on-chain (createEscrow + addMilestone) firmado por tu billetera.
              </p>
            </form>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
            <div className="bg-surface-container-lowest rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-surface-container-high/40 pointer-events-none flex items-center justify-center">
                <span className="material-symbols-outlined text-[72px] text-surface-container-highest">gavel</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Comprobante Institucional</span>
                  <h3 className="font-title-lg text-title-lg font-bold text-primary">Factura #{invoiceId}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">shield_with_heart</span>
                  {createdEscrowId ? "Custodia en testnet" : "Lista para enviar"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Receptor / Pagador:</span>
                  <span className="font-semibold text-on-surface">{clientEmail || "Sin cliente asignado"}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Concepto:</span>
                  <span className="font-medium text-on-surface text-right truncate max-w-[200px]">
                    {concept || "Servicio general"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Período de revisión:</span>
                  <span className="font-medium text-on-surface">{term.split("(")[0].trim()}</span>
                </div>
                {createdEscrowId && (
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="text-on-surface-variant">Escrow on-chain:</span>
                    <span className="font-mono font-semibold text-primary">{createdEscrowId}</span>
                  </div>
                )}
              </div>

              <div className="p-space-md rounded-xl bg-surface-container text-center flex flex-col items-center justify-center gap-1">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">
                  TOTAL A DEPOSITAR EN CUSTODIA
                </span>
                <span className="font-amount-display text-amount-display text-primary font-bold tracking-tight">
                  {formatLatamCurrency(amount)}
                </span>
                <span className="text-label-sm font-label-sm text-secondary font-semibold bg-surface-container-lowest px-2 py-0.5 rounded-full shadow-sm">
                  Custodia inteligente vinculada a Stellar Ledger
                </span>
              </div>

              {/* Payment Link */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold flex items-center justify-between">
                  <span>Enlace de Cobro Seguro para tu cliente:</span>
                  <span className={`text-secondary font-bold font-label-sm text-label-sm ${copyFeedback || createdEscrowId ? "" : "hidden"}`}>
                    {createdEscrowId ? "¡Custodia creada en testnet!" : ""}
                    {copyFeedback ? " ¡Copiado al portapapeles!" : ""}
                  </span>
                </label>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-surface-container-low shadow-inner">
                  <div className="flex-1 px-2.5 py-1.5 truncate text-body-sm font-body-sm font-mono text-primary font-medium select-all">
                    {paymentLink || "El enlace real aparece aquí al crear la custodia en testnet"}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!paymentLink}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm shrink-0 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>Copiar</span>
                  </button>
                </div>
              </div>

              {/* Real on-chain transactions */}
              {txRecords.length > 0 && (
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Transacciones reales en Testnet
                  </span>
                  {txRecords.map((t) => (
                    <div key={t.hash} className="flex items-center justify-between gap-2 text-body-sm font-body-sm">
                      <span className="text-on-surface-variant">{t.label}</span>
                      <a
                        href={explorerTxUrl(t.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-primary font-semibold hover:underline truncate max-w-[180px]"
                      >
                        {t.hash.slice(0, 12)}…
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Testnet contract reference (real, replaces decorative QR) */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md">
                <div className="w-12 h-12 bg-surface-container-lowest rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[28px]">verified_user</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Contrato de custodia en Testnet</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Custodia programable verificable en el explorer. Firmás cada paso con Freighter.
                  </p>
                  <a
                    href={EXPLORER_CONTRACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <span className="font-mono">{truncateAddress(ESCROW_CONTRACT_ADDRESS, 6)}</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-space-xs pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Descargar PDF</span>
                </button>
                <a
                  href={mailtoHref()}
                  className="h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Enviar por Correo</span>
                </a>
              </div>

              {/* Assurance */}
              <div className="p-3 rounded-lg bg-secondary-container/30 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">verified_user</span>
                <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                  <strong className="font-semibold text-secondary">Garantía de cobro para el profesional:</strong>{" "}
                  Al enviar este enlace, tu cliente podrá depositar el dinero en garantía antes de que empieces a trabajar.{" "}
                  <span className="font-semibold">Nunca más trabajarás sin certeza de pago.</span>
                </p>
              </div>
            </div>

            {/* Trust Card */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold">✓</div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Fondos Custodiados en Bóveda Stellar</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Inmunes a quiebras de plataformas o disputas arbitrarias</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-space-xl grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {[
            {
              name: "Matías Rossi",
              role: "Desarrollador Full-Stack • Buenos Aires",
              quote: "Antes cobraba vía transferencias SWIFT que tardaban 8 días y me sacaban 80 USD entre bancos corresponsales. Con PactoPay, el cliente deposita en USDC y cuando entrego la pull request, el cobro cae en segundos.",
              amount: "Testimonio ilustrativo",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwG7PErM9guOlAX08fDNinNFdmsMdPiFF2ECsKn69G9uENqzjPL22X4DW1NsH5Fnk8L5pFVmGU2WXNZwca3IzVG1vG4okIUIF61Bq4kHaRp3c-Hml8f7-Aa9t5CAn4ZUVACd1c4YN1CE2bHKThBLGDT2zM1Xyw9ylKW-ILLMT7VycrtpLe8XHoGGkwBNmxzenxh0__5JE6Ucj0ikKVtX857PMrskly_J-M1yqcMWM",
            },
            {
              name: "Camila Valenzuela",
              role: "Diseñadora UI/UX • Medellín",
              quote: "Mis clientes de EE.UU. preferían no enviar adelantos por temor a retrasos, y yo no podía arrancar sin anticipo. La custodia de PactoPay resolvió la desconfianza por completo.",
              amount: "Testimonio ilustrativo",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8P6KSlEJnyVJnESuaMv_ARAv2_mqHRqU_vR6g_7BCUNCLsdgYPevaG7gTpOlN9vkLNbrB7Mw4Rph0NTCReCwNFK_FDSVTfXQiowOMjY21Wif0A-8gO8yEAkU5K3uc6l6tYLrOXCZyg6AhW3OebszRpTBZAAZwKtVi-9SI3KOt9C_ERkcPUIa4JEKNYPo0uPkvkxC1S8_ANYobU4Kk2JxV34ePDTbuDWnRakAiWu8",
            },
          ].map((t) => (
            <div key={t.name} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <img className="w-12 h-12 rounded-full object-cover shadow-inner" src={t.img} alt={t.name} />
                <div>
                  <h4 className="font-label-lg text-label-lg font-bold text-on-surface">{t.name}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.role}</p>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">"{t.quote}"</p>
              <div className="flex items-center gap-1 text-label-sm font-label-sm text-secondary font-bold mt-auto">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{t.amount}</span>
              </div>
            </div>
          ))}
          {/* Metrics Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Estado de Red</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">Testnet</span>
              </div>
              <div className="font-amount-display text-amount-display text-primary font-bold tracking-tight mb-1">Stellar Testnet</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                Contrato de custodia desplegado en la red de prueba. Verificá cada transacción en el explorer.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1 text-body-sm font-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Cierre de ledger en Stellar:</span>
                <span className="font-bold text-secondary">~5 segundos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Tarifa base por transacción:</span>
                <span className="font-bold text-on-surface">0,00001 XLM</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg mb-space-xl">
          <div className="text-center max-w-2xl mx-auto mb-space-lg">
            <span className="text-label-sm font-label-sm font-bold text-primary tracking-widest uppercase bg-surface-container px-3 py-1 rounded-full">
              Método Simple y Transparente
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-space-xs mb-2">
              Cómo funciona el cobro seguro en 3 pasos sencillos
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Diseñado para dar total tranquilidad tanto a quien contrata como a quien realiza el trabajo profesional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {[
              { num: "1", color: "bg-primary text-on-primary", title: "Envías la factura", desc: "Tu cliente recibe el enlace seguro y ve el desglose exacto de los fondos, tiempos y entregables sin sorpresas ni letra chica.", icon: "link", iconColor: "text-primary", footer: "Enlace compatible con cualquier navegador" },
              { num: "2", color: "bg-secondary text-on-secondary", title: "Cliente asegura el dinero", desc: "Los fondos quedan protegidos en custodia respaldada por Stellar. Nadie puede tocarlos ni cancelarlos unilateralmente.", icon: "lock_clock", iconColor: "text-secondary", footer: "Notificación instantánea de depósito en garantía" },
              { num: "3", color: "bg-primary-container text-on-primary", title: "Entregas y recibes", desc: "Tras revisar tu trabajo acordado, los fondos se liberan en USDC a tu billetera Stellar con una transacción verificable.", icon: "currency_exchange", iconColor: "text-primary", footer: "Liberación a tu billetera Stellar en USDC" },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low relative">
                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center font-title-lg text-title-lg font-bold shadow-sm`}>
                  {step.num}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{step.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1 text-label-sm font-label-sm text-primary font-semibold">
                  <span className={`material-symbols-outlined text-[16px] ${step.iconColor}`}>{step.icon}</span>
                  <span>{step.footer}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-space-lg pt-space-md border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-md text-body-sm font-body-sm text-on-surface-variant">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">policy</span>
              <span>Cumplimiento con directrices bancarias internacionales de custodia comercial (Escrow B2B).</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-semibold text-on-surface">Auditorías criptográficas públicas</span>
              <span className="text-outline-variant">•</span>
              <span>Cero incidentes de seguridad registrados</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-space-xl">
          <div className="flex flex-col gap-space-md">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Preguntas frecuentes sobre la custodia PactoPay</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Resolvemos las dudas más habituales de los profesionales que cobran al exterior.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {[
                { q: "¿Mi cliente necesita tener criptomonedas o Stellar?", a: "Sí, en esta versión. Tu cliente fondea la custodia en USDC desde su billetera Stellar (por ejemplo Freighter) en la red de prueba. Todavía no hay fondeo con tarjeta ni transferencia bancaria." },
                { q: "¿Qué pasa si el cliente no responde tras la entrega?", a: "Hoy no hay autoliquidación por plazo en el contrato: la liberación la aprueba el pagador desde el Panel de Control. Si hay desacuerdo, cualquiera de las partes puede abrir una disputa on-chain y el remanente vuelve al pagador con un refund verificable." },
                { q: "¿Cómo convierto los USDC a mi moneda local?", a: "En esta versión los fondos se liberan en USDC a tu billetera Stellar. El retiro a moneda local (Mercado Pago, SPEI, PIX, etc.) todavía no está integrado." },
                { q: "¿Por qué la comisión es solo del 0,5%?", a: "Ese 0,5% es el modelo previsto para producción y se muestra como estimación. On-chain en testnet no se retiene nada: solo pagás la tarifa base de Stellar (0,00001 XLM por transacción)." },
              ].map((faq) => (
                <div key={faq.q} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5">
                  <h4 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">help_outline</span>
                    {faq.q}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Transaction Feedback Toast (real hashes) */}
      <TxFeedback
        status={txState.status}
        txHash={txState.txHash}
        error={txState.error}
        onDismiss={reset}
      />
    </div>
  );
}
