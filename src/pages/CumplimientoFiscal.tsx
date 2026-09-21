import { useState } from "react";

const CERTIFICATES = [
  { id: "#CERT-2025-091", hash: "0x4f3e...8a19b3", beneficiary: "Fernando May", payer: "Apex Labs S.A.", entity: "🇲🇽 SAT (CFDI 4.0)", amount: "$1.500,00 USDC", status: "signed" },
  { id: "#CERT-2025-089", hash: "0x9c21...47df10", beneficiary: "Estudio Creativo Alpha", payer: "Nordic Ventures Inc.", entity: "🇦🇷 ARCA (Factura E)", amount: "$3.400,00 USDC", status: "sent" },
  { id: "#CERT-2025-084", hash: "0x17ea...6b89c4", beneficiary: "Valeria Quispe Tech", payer: "FinScale Corp.", entity: "🇵🇪 SUNAT (RHE)", amount: "$2.150,00 USDC", status: "signed" },
  { id: "#CERT-2025-078", hash: "0x3d9c...22f1", beneficiary: "Andrés Mejía", payer: "Bogotá Tech SAS", entity: "🇨🇴 DIAN (Factura Exp.)", amount: "$4.200,00 USDC", status: "signed" },
  { id: "#CERT-2025-072", hash: "0x6e1b...99a4", beneficiary: "Javiera Morales", payer: "Santiago Devs", entity: "🇨🇱 SII (FEE Tipo 110)", amount: "$2.850,00 USDC", status: "signed" },
];

const COUNTRIES = [
  {
    flag: "🇲🇽",
    name: "México",
    entity: "SAT",
    status: "Homologado",
    statusColor: "bg-secondary-container text-on-secondary-container",
    regime: "CFDI 4.0",
    regimeDetail: "Régimen General de Ley",
    checks: [
      { text: "RFC validado y homologado con PAC", ok: true },
      { text: "Timbrado automático ante el SAT", ok: true },
      { text: "Complemento de pago incluido", ok: true },
    ],
    retention: [
      { label: "IVA Retenido", value: "16%" },
      { label: "ISR Retenido", value: "10%" },
      { label: "Retención honorarios", value: "Caso por caso" },
    ],
    count: "12 CFDI",
    countDetail: "emitidos este periodo",
    action: "Ver Comprobantes",
  },
  {
    flag: "🇦🇷",
    name: "Argentina",
    entity: "ARCA",
    status: "En Plazos",
    statusColor: "bg-tertiary-fixed text-on-tertiary-fixed",
    regime: "Factura E",
    regimeDetail: "Monotributo / Responsable Inscripto",
    checks: [
      { text: "CAI/CUIT validado con ARCA", ok: true },
      { text: "Factura E electrónica generada", ok: true },
      { text: "Resolución General 4619 aplicada", ok: true },
    ],
    retention: null,
    progress: { label: "Comprobante E pendiente de presentación", current: 18400, target: 36000, unit: "USD" },
    count: "8 Facturas E",
    countDetail: "emitidas este periodo",
    action: "Ver Detalle Fiscal",
  },
  {
    flag: "🇵🇪",
    name: "Perú",
    entity: "SUNAT",
    status: "Inafecto IGV",
    statusColor: "bg-secondary-container text-on-secondary-container",
    regime: "RHE (Recibo por Honorarios)",
    regimeDetail: "Servicios profesionales inafectos",
    checks: [
      { text: "RUC validado ante SUNAT", ok: true },
      { text: "RHE emitido con código de verificación", ok: true },
      { text: "Consulta de validación SUNAT activa", ok: true },
    ],
    retention: [
      { label: "5ta categoría", value: "8%" },
      { label: "ONP (si aplica)", value: "3%" },
      { label: "EsSalud", value: "N/A" },
    ],
    count: "8 RHE",
    countDetail: "emitidos este periodo",
    action: "Ver Recibos",
  },
  {
    flag: "🇨🇴",
    name: "Colombia",
    entity: "DIAN",
    status: "Homologado",
    statusColor: "bg-secondary-container text-on-secondary-container",
    regime: "Factura Exp. Tipo 02",
    regimeDetail: "Exportación de servicios",
    checks: [
      { text: "NIT validado con DIAN", ok: true },
      { text: "Resolución de facturación vigente", ok: true },
      { text: "CUDE asignado correctamente", ok: true },
    ],
    retention: [
      { label: "Retención en la fuente", value: "11%" },
      { label: "Retención IVA", value: "N/A" },
      { label: "RETICA", value: "0%" },
    ],
    count: "15 Facturas DIAN",
    countDetail: "emitidas este periodo",
    action: "Ver Facturación",
  },
  {
    flag: "🇨🇱",
    name: "Chile",
    entity: "SII",
    status: "Exento IVA",
    statusColor: "bg-secondary-container text-on-secondary-container",
    regime: "FEE 110 (Factura de Exportación Electrónica)",
    regimeDetail: "Servicios de exportación exentos",
    checks: [
      { text: "RUT validado ante SII", ok: true },
      { text: "FEE generada en formato XML", ok: true },
      { text: "Sistema de certificación SII activo", ok: true },
    ],
    retention: [
      { label: "Retención segunda categoría", value: "15%" },
      { label: "IVA Exento", value: "0%" },
      { label: "Boleta de honorarios", value: "N/A" },
    ],
    count: "9 Documentos FEE",
    countDetail: "emitidos este periodo",
    action: "Ver Documentos",
  },
];

const TAX_ENTITIES = [
  { id: "sat", label: "SAT", country: "🇲🇽" },
  { id: "arca", label: "ARCA", country: "🇦🇷" },
  { id: "sunat", label: "SUNAT", country: "🇵🇪" },
  { id: "dian", label: "DIAN", country: "🇨🇴" },
  { id: "sii", label: "SII", country: "🇨🇱" },
];

export function CumplimientoFiscal() {
  const [activeTaxEntity, setActiveTaxEntity] = useState("sat");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [dossierDownloading, setDossierDownloading] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const handleDossier = () => {
    setDossierDownloading(true);
    setTimeout(() => {
      setDossierDownloading(false);
    }, 1800);
  };

  return (
    <div className="w-full pt-0 bg-surface flex-1">
      <div className="max-w-7xl mx-auto px-gutter py-margin">
        <div className="flex flex-col w-full">

          {/* ───────────────────────────────────────────────
              SECTION A — Hero Header
          ─────────────────────────────────────────────── */}
          <section className="mb-space-xl relative">
            <div className="max-w-5xl">
              <div className="flex flex-wrap items-center gap-space-xs mb-space-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                  PORTAL DE CUMPLIMIENTO &amp; AUDITORÍA FISCAL LATAM
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">encryption</span>
                  Verificación Criptográfica Activa
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight mb-space-sm">
                Facturación Transfronteriza en Cumplimiento con las{" "}
                <span className="text-primary font-bold">Normativas Locales</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-3xl mb-space-lg">
                Genera comprobantes fiscales válidos en 5 países de Latinoamérica. Cada certificado
                está anclado criptográficamente a la red Stellar y cumple con los formatos oficiales
                de cada autoridad tributaria.
              </p>

              <div className="flex flex-wrap items-center gap-space-sm">
                {/* Fiscal year selector */}
                <div className="flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container-lowest shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">Periodo Fiscal:</span>
                  <select className="bg-transparent text-on-surface font-label-lg text-label-lg font-bold focus:outline-none cursor-pointer">
                    <option>2025</option>
                    <option>2024</option>
                    <option>2023</option>
                  </select>
                </div>

                {/* Dossier button */}
                <button
                  type="button"
                  onClick={handleDossier}
                  disabled={dossierDownloading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  {dossierDownloading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Empaquetando Dossier...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">folder_zip</span>
                      Descargar Dossier Fiscal Consolidado (ZIP)
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────────
              SECTION B — Country Regulatory Matrix
          ─────────────────────────────────────────────── */}
          <section className="mb-space-xl">
            <div className="flex items-center justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">public</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Matriz Regulatoria por País</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Estado de homologación y cumplimiento con las autoridades tributarias de cada jurisdicción.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  5 Países Activos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
              {COUNTRIES.map((c) => (
                <div
                  key={c.name}
                  className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-space-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl leading-none">{c.flag}</span>
                      <div>
                        <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{c.name}</h3>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{c.entity}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${c.statusColor}`}>
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      {c.status}
                    </span>
                  </div>

                  {/* Regime */}
                  <div className="p-2.5 rounded-lg bg-surface-container-low mb-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">Régimen Aplicable</span>
                    <span className="font-title-md text-title-md text-primary font-bold">{c.regime}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">{c.regimeDetail}</span>
                  </div>

                  {/* Check items */}
                  <div className="flex flex-col gap-1.5 mb-space-sm">
                    {c.checks.map((ch) => (
                      <div key={ch.text} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[18px]">
                          {ch.ok ? "check_circle" : "pending"}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface">{ch.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Retention breakdown */}
                  {c.retention && (
                    <div className="p-2.5 rounded-lg bg-surface-container-low mb-space-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Desglose de Retenciones</span>
                      <div className="flex flex-col gap-1">
                        {c.retention.map((r) => (
                          <div key={r.label} className="flex items-center justify-between text-body-sm font-body-sm">
                            <span className="text-on-surface-variant">{r.label}</span>
                            <span className="font-semibold text-on-surface">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress bar (Argentina) */}
                  {c.progress && (
                    <div className="p-2.5 rounded-lg bg-surface-container-low mb-space-sm">
                      <div className="flex items-center justify-between text-body-sm font-body-sm mb-1.5">
                        <span className="text-on-surface-variant">{c.progress.label}</span>
                        <span className="font-semibold text-on-surface">
                          ${c.progress.current.toLocaleString()}/{c.progress.target.toLocaleString()} {c.progress.unit}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-tertiary-container rounded-full transition-all"
                          style={{ width: `${(c.progress.current / c.progress.target) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 block">
                        {Math.round((c.progress.current / c.progress.target) * 100)}% del umbral de facturación
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{c.count}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block">{c.countDetail}</span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      {c.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ───────────────────────────────────────────────
              SECTION C — Certificate Generator
          ─────────────────────────────────────────────── */}
          <section className="mb-space-xl rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
            <div className="flex items-center gap-space-sm mb-space-lg">
              <span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Generador de Certificados Fiscales</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Genera un certificado fiscal firmado criptográficamente vinculado a un contrato de custodia Stellar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              {/* Left: Generator Form */}
              <div className="lg:col-span-6 flex flex-col gap-space-md">
                {/* Contract selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-lg text-label-lg text-on-surface font-medium">Contrato de Custodia Vinculado</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">description</span>
                    <select className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-inner">
                      <option>#PACTO-7729 — Fernando May ↔ Apex Labs S.A. — $1.500 USDC</option>
                      <option>#PACTO-7654 — Estudio Creativo Alpha ↔ Nordic Ventures Inc. — $3.400 USDC</option>
                      <option>#PACTO-7598 — Valeria Quispe Tech ↔ FinScale Corp. — $2.150 USDC</option>
                      <option>#PACTO-7531 — Andrés Mejía ↔ Bogotá Tech SAS — $4.200 USDC</option>
                      <option>#PACTO-7489 — Javiera Morales ↔ Santiago Devs — $2.850 USDC</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-space-xs">
                  {[
                    { label: "Hash Soroban", value: "0x4f3e...8a19b3", icon: "token" },
                    { label: "Fecha de Emisión", value: "24 Oct 2025", icon: "event" },
                    { label: "Tipo de Cambio", value: "1 USDC = $1.00 USD", icon: "currency_exchange" },
                    { label: "ID Fiscal Extranjero", value: "RFC: FAR850101XYZ", icon: "badge" },
                  ].map((m) => (
                    <div key={m.label} className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-0.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                        {m.label}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface font-semibold font-mono truncate">{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* Tax entity selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-lg text-label-lg text-on-surface font-medium">Entidad Tributaria Destino</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {TAX_ENTITIES.map((te) => (
                      <button
                        key={te.id}
                        type="button"
                        onClick={() => setActiveTaxEntity(te.id)}
                        className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                          activeTaxEntity === te.id
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span className="text-lg leading-none">{te.country}</span>
                        <span>{te.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-2">
                  {[
                    "Validar formato contra esquema oficial de la entidad",
                    "Adjuntar desglose de retenciones aplicables",
                    "Incluir sello criptográfico Ed25519 verificable",
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-outline-variant text-primary accent-primary focus:ring-primary/20"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">{item}</span>
                    </label>
                  ))}
                </div>

                {/* Generate button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className={`w-full py-3.5 px-space-md rounded-xl font-title-md text-title-md font-bold shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.99] ${
                    generated
                      ? "bg-secondary-container text-on-secondary-container cursor-default"
                      : "bg-primary hover:bg-primary-container text-on-primary hover:shadow-lg"
                  }`}
                >
                  {generating ? (
                    <>
                      <span className="material-symbols-outlined text-[22px] animate-spin">progress_activity</span>
                      Generando Certificado Fiscal...
                    </>
                  ) : generated ? (
                    <>
                      <span className="material-symbols-outlined text-[22px]">check_circle</span>
                      Certificado Generado y Firmado
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">workspace_premium</span>
                      Generar Certificado Fiscal
                    </>
                  )}
                </button>
              </div>

              {/* Right: Live Certificate Preview */}
              <div className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 p-space-lg shadow-md relative overflow-hidden flex flex-col">
                  {/* Decorative watermark */}
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-primary/5 pointer-events-none flex items-center justify-center">
                    <span className="material-symbols-outlined text-[80px] text-primary/10">verified_user</span>
                  </div>

                  {/* Letterhead */}
                  <div className="flex items-start justify-between mb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
                      </div>
                      <div>
                        <span className="font-title-md text-title-md font-bold tracking-tight text-primary block">PactoPay</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Certificado Fiscal Transfronterizo</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      Firmado
                    </span>
                  </div>

                  {/* Declaration */}
                  <div className="p-space-md rounded-lg bg-surface-container-low mb-space-md">
                    <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                      Por medio del presente, <strong>PactoPay</strong> certifica que el contrato de custodia <strong className="font-mono">#PACTO-7729</strong> fue
                      liquidado conforme con los términos acordados entre las partes, y que los fondos fueron transferidos de forma
                      irreversible a la billetera federada del beneficiario en la red Stellar.
                    </p>
                  </div>

                  {/* Financial table */}
                  <div className="mb-space-md">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold block mb-2">Resumen Financiero</span>
                    <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                      {[
                        { label: "Monto total del contrato:", value: "$1.500,00 USDC" },
                        { label: "Comisión PactoPay:", value: "$0,00 USDC (Bonificada)" },
                        { label: "Costo de red Stellar:", value: "< $0,001 USD" },
                        { label: "Monto neto liberado:", value: "$1.500,00 USDC", bold: true },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-body-sm font-body-sm">
                          <span className="text-on-surface-variant">{row.label}</span>
                          <span className={`font-semibold ${row.bold ? "text-secondary text-title-md" : "text-on-surface"}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retention breakdown grid */}
                  <div className="mb-space-md">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold block mb-2">Desglose de Retenciones Aplicadas</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "IVA Retenido", value: "16%", icon: "receipt" },
                        { label: "ISR Retenido", value: "10%", icon: "account_balance" },
                        { label: "Total Retenido", value: "$390,00", icon: "percent", highlight: true },
                      ].map((r) => (
                        <div key={r.label} className={`p-2.5 rounded-lg text-center ${r.highlight ? "bg-primary-container text-on-primary" : "bg-surface-container-low"}`}>
                          <span className={`material-symbols-outlined text-[18px] block mb-0.5 ${r.highlight ? "text-on-primary" : "text-primary"}`}>{r.icon}</span>
                          <span className={`font-label-sm text-label-sm block ${r.highlight ? "text-on-primary/80" : "text-on-surface-variant"}`}>{r.label}</span>
                          <span className={`font-title-md text-title-md font-bold block ${r.highlight ? "text-on-primary" : "text-on-surface"}`}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cryptographic seal footer */}
                  <div className="pt-space-sm border-t border-outline-variant/30 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Sello Criptográfico:</span>
                      <span className="font-mono text-[11px] text-on-surface font-semibold truncate">0x4f3e7b2c...8a19b3d6e2f0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">key</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Llave Pública Ed25519:</span>
                      <span className="font-mono text-[11px] text-on-surface font-semibold truncate">GDXR...Q7KP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">fingerprint</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Firma Digital:</span>
                      <span className="font-mono text-[11px] text-on-surface font-semibold truncate">MIIEvgIBADANBg...OK</span>
                    </div>
                  </div>
                </div>

                {/* Certificate actions */}
                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    className="h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Descargar PDF
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Enviar a la Entidad
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────────
              SECTION D — Institutional Guarantees
          ─────────────────────────────────────────────── */}
          <section className="mb-space-xl">
            <div className="flex items-center gap-space-sm mb-space-lg">
              <span className="material-symbols-outlined text-primary text-[22px]">gpp_good</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Garantías Institucionales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {[
                {
                  icon: "shield",
                  title: "AML / KYC",
                  desc: "Verificación de identidad y prevención de lavado de dinero conforme a las directrices FATF y normativas locales de cada jurisdicción.",
                  color: "bg-primary-container text-on-primary",
                },
                {
                  icon: "gavel",
                  title: "Soporte Legal",
                  desc: "Cada certificado incluye referencias legales a los artículos y resoluciones aplicables de la autoridad tributaria de cada país.",
                  color: "bg-secondary-container text-on-secondary-container",
                },
                {
                  icon: "account_balance",
                  title: "Diseño No Custodial",
                  desc: "PactoPay nunca custody los fondos. Los USDC están en un contrato inteligente Soroban auditado en la red Stellar.",
                  color: "bg-surface-container-high text-primary",
                },
                {
                  icon: "verified",
                  title: "Validación Fiscal",
                  desc: "Cada comprobante es validado contra el esquema oficial de la entidad tributaria antes de ser marcado como emitido.",
                  color: "bg-primary text-on-primary",
                },
              ].map((g) => (
                <div key={g.title} className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col gap-space-sm">
                  <div className={`w-10 h-10 rounded-lg ${g.color} flex items-center justify-center shadow-sm`}>
                    <span className="material-symbols-outlined text-[22px]">{g.icon}</span>
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold">{g.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ───────────────────────────────────────────────
              SECTION E — Audit Trail Table
          ─────────────────────────────────────────────── */}
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Registro de Auditoría Fiscal</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Certificados emitidos y su estado actual de validación.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md font-semibold bg-secondary-container px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  5 Certificados Registrados
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">ID</th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Hash del Contrato</th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider hidden md:table-cell">Beneficiario</th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider hidden lg:table-cell">Entidad Tributaria</th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Monto</th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-center">Estado</th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {CERTIFICATES.map((cert) => (
                    <tr key={cert.id} className="border-b border-outline-variant/15 hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 font-mono text-body-sm text-body-sm font-semibold text-primary">{cert.id}</td>
                      <td className="py-3.5 font-mono text-body-sm text-body-sm text-on-surface">{cert.hash}</td>
                      <td className="py-3.5 hidden md:table-cell">
                        <div>
                          <span className="font-body-sm text-body-sm text-on-surface font-semibold block">{cert.beneficiary}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">← {cert.payer}</span>
                        </div>
                      </td>
                      <td className="py-3.5 hidden lg:table-cell font-body-sm text-body-sm text-on-surface">{cert.entity}</td>
                      <td className="py-3.5 text-right font-title-md text-title-md font-bold text-on-surface whitespace-nowrap">{cert.amount}</td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                          cert.status === "signed"
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-tertiary-fixed text-on-tertiary-fixed"
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {cert.status === "signed" ? "verified" : "schedule_send"}
                          </span>
                          {cert.status === "signed" ? "Firmado" : "Enviado"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div className="mt-space-md pt-space-md border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-body-sm font-body-sm text-on-surface-variant">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">policy</span>
                <span>Cada certificado está respaldado por un sello criptográfico Ed25519 verificable en la red Stellar.</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="font-semibold text-on-surface">Auditorías públicas</span>
                <span className="text-outline-variant">•</span>
                <span>Zero-knowledge proofs disponibles</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
