import { useState } from "react";
import { formatLatamCurrency } from "../lib/format";

export function PanelControl() {
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  const handleRelease = () => {
    setReleasing(true);
    setTimeout(() => {
      setReleasing(false);
      setShowReleaseModal(false);
      setReleased(true);
    }, 1500);
  };

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
                  Los fondos están inmovilizados en la bóveda Stellar hasta que apruebes formalmente la entrega final.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Contrato: <span className="font-mono text-primary font-bold">#PACTO-7729</span>
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
                  Factura #INV-2026-0042
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Gestión de Custodia Activa
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex flex-wrap items-center gap-2">
                <span className="font-medium text-on-surface">Contratación de Servicios de Desarrollo UI/UX</span>
                <span>•</span>
                <span>Cliente: <strong className="text-on-surface font-semibold">Apex Labs S.A.</strong></span>
                <span>•</span>
                <span>Profesional: <strong className="text-on-surface font-semibold">Fernando May</strong></span>
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <button type="button" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md text-label-md shadow-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Descargar Factura (PDF)
              </button>
              <button type="button" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md text-label-md shadow-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">share</span>
                Compartir Estado
              </button>
            </div>
          </div>

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
                  <span className="font-amount-display text-amount-display text-primary font-bold tracking-tight">$ 1.500,00</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-semibold text-primary">USDC</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">lock_clock</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">100% resguardados en contrato inteligente seguro</span>
              </div>
            </div>

            {/* Contractor */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Profesional Destinatario</span>
                  <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Verificado
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsgWDBV19S6O_YYl1atONz_utQqZpK6Joa_4is-XnAOS0aSTb7j_r4x_g07S7zGlxRE_F5CbOKv0cTYUNq0RCWhZ0fQi_G9Y4l-Fo-4ML0U3atSG4mtw_xhfKh5CKXwBTI854aD24gXNbEEmPqqZ2s3nIzgbj1-C4h9nY18nqM6hkjL5k44hwNvscBwlyUkTK5ASNly85CWrfmfdue-0f2LQXc-XDIYdI0W-6Nnyk" alt="Fernando May" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-title-md text-title-md text-on-surface font-bold truncate">Fernando May</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">MIRAI Labs • Proveedor Nivel 1</p>
                  </div>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">military_tech</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Identidad Verificada ✓ • 100% entregas a tiempo</span>
              </div>
            </div>

            {/* Review Window */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-surface-container pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Ventana de Inspección</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">
                    Conforme a Contrato
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-amount-display text-amount-display text-on-surface font-bold tracking-tight">12 días</span>
                  <span className="font-body-md text-body-md text-on-surface-variant font-medium">restantes</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">schedule</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Ventana de inspección vence el 3 de Noviembre</span>
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
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Revisión de Entregables del Proyecto</h2>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Comprueba que el trabajo presentado concuerde con los criterios técnicos pactados.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-container-low px-3 py-1.5 rounded-lg">
                    <span className="font-label-md text-label-md text-on-surface-variant">Progreso:</span>
                    <span className="font-label-md text-label-md font-bold text-secondary">2 de 3 completados</span>
                    <div className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: "66.6%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="flex flex-col gap-space-md">
                  {/* Milestone 1 - Approved */}
                  <div className="rounded-xl bg-surface p-space-md shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:bg-surface-container-low/70">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">check</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Hito 01</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                              <span className="material-symbols-outlined text-[13px]">verified</span> Verificado y Aprobado
                            </span>
                          </div>
                          <h3 className="font-title-md text-title-md text-on-surface font-semibold mt-1">Diseño en Figma y Especificaciones de Arquitectura</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sistemas de diseño, wireframes con responsive behavior y kit de componentes UI homologado.</p>
                        </div>
                      </div>
                      <a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container font-label-md text-label-md font-semibold self-start sm:self-auto shadow-sm transition-all shrink-0" href="#">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Ver en Figma
                        <span className="material-symbols-outlined text-[14px]">north_east</span>
                      </a>
                    </div>
                    <div className="mt-space-sm pl-12 flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
                      <span className="flex items-center gap-1 text-[12px]"><span className="material-symbols-outlined text-[15px] text-secondary">event_available</span> Aprobado el 28 Sept</span>
                      <span className="text-outline-variant">•</span>
                      <span className="text-[12px]">Liberación parcial: $ 500,00 USDC</span>
                    </div>
                  </div>

                  {/* Milestone 2 - Approved */}
                  <div className="rounded-xl bg-surface p-space-md shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:bg-surface-container-low/70">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">check</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Hito 02</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                              <span className="material-symbols-outlined text-[13px]">verified</span> Verificado y Aprobado
                            </span>
                          </div>
                          <h3 className="font-title-md text-title-md text-on-surface font-semibold mt-1">Código Fuente del Smart Contract e Integración</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Contrato de depósito en Soroban/Rust con suite de pruebas automatizadas y cobertura superior al 95%.</p>
                        </div>
                      </div>
                      <a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container font-label-md text-label-md font-semibold self-start sm:self-auto shadow-sm transition-all shrink-0" href="#">
                        <span className="material-symbols-outlined text-[16px]">code</span>
                        Ver GitHub PR
                        <span className="material-symbols-outlined text-[14px]">north_east</span>
                      </a>
                    </div>
                    <div className="mt-space-sm pl-12 flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
                      <span className="flex items-center gap-1 text-[12px]"><span className="material-symbols-outlined text-[15px] text-secondary">event_available</span> Aprobado el 12 Oct</span>
                      <span className="text-outline-variant">•</span>
                      <span className="text-[12px]">Auditoría estática aprobada</span>
                    </div>
                  </div>

                  {/* Milestone 3 - Pending */}
                  <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-md ring-2 ring-primary/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0 mt-0.5 shadow-sm animate-pulse">
                          <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-sm text-label-sm font-semibold uppercase text-tertiary-container">Hito 03 (Hito Final)</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                              <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                              Enviado para tu Aprobación Final
                            </span>
                          </div>
                          <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1">Despliegue en Red de Pruebas y Manual de Usuario</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Instancia desplegada y operativa en Stellar Testnet, documentación completa en Markdown y video explicativo.</p>
                        </div>
                      </div>
                      <a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high font-label-md text-label-md font-semibold shadow-sm transition-all" href="#">
                        <span className="material-symbols-outlined text-[16px]">preview</span>
                        Probar Demo
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                    {/* Attachments */}
                    <div className="mt-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                      {[
                        { icon: "description", name: "Manual_Usuario_v1.0.pdf" },
                        { icon: "play_circle", name: "Demo_Walkthrough_Loom.mp4" },
                      ].map((a) => (
                        <div key={a.name} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-body-sm">
                          <span className="flex items-center gap-2 truncate">
                            <span className="material-symbols-outlined text-primary text-[18px]">{a.icon}</span>
                            <span className="truncate">{a.name}</span>
                          </span>
                          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">download</span>
                        </div>
                      ))}
                    </div>
                    {/* Note */}
                    <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">format_quote</span>
                      </div>
                      <div className="text-on-surface">
                        <p className="font-body-md text-body-md italic leading-relaxed text-on-surface">
                          "Hola! He completado el despliegue final y la documentación técnica de integración.
                          Todos los tests pasaron exitosamente. Quedo atento a tu revisión final para la liberación del saldo."
                        </p>
                        <p className="font-label-md text-label-md font-bold text-primary mt-2">
                          — Fernando May, Líder Técnico UI/UX
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <span className="px-2.5 py-1 rounded bg-surface-container font-mono text-[11px] text-on-surface font-semibold">SOROBAN-TEST-ESCROW-V2</span>
                </div>
              </div>
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
                      <span className="font-semibold text-on-surface">$ 1.500,00 USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        Comisión de servicio:
                        <span className="material-symbols-outlined text-[14px] text-secondary" title="Promoción 0%">info</span>
                      </span>
                      <span className="font-semibold text-secondary">$ 0,00 USDC <span className="text-[11px] font-normal">(Bonificado)</span></span>
                    </div>
                    <div className="pt-space-xs mt-space-xs bg-surface-container-highest/60 -mx-space-md px-space-md py-2 flex items-center justify-between rounded-b-lg">
                      <span className="font-title-md text-title-md font-bold text-on-surface">Monto neto a liberar:</span>
                      <div className="text-right">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">$ 1.500,00</span>
                        <span className="font-label-sm text-label-sm font-bold text-primary ml-1">USDC</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-2.5 mb-space-md">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">verified_user</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                      Al hacer clic, el dinero se transferirá de inmediato a la cuenta de <strong>Fernando May</strong>. Esta operación es definitiva e irreversible.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-space-sm">
                  <button
                    onClick={() => !released && setShowReleaseModal(true)}
                    disabled={released}
                    className={`w-full py-3.5 px-space-md rounded-xl font-title-md text-title-md font-bold shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.99] ${
                      released
                        ? "bg-surface-container-high text-on-surface-variant cursor-default"
                        : "bg-secondary hover:bg-secondary/90 text-on-secondary hover:shadow-lg"
                    }`}
                  >
                    {released ? (
                      <>
                        <span className="material-symbols-outlined text-[22px]">check_circle</span>
                        Fondos Liberados
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">lock_open</span>
                        Aprobar y Liberar $ 1.500,00 USDC
                      </>
                    )}
                  </button>
                  <div className="pt-space-xs flex flex-col gap-2 text-center">
                    <button type="button" className="py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors">
                      <span className="material-symbols-outlined text-[17px]">replay</span>
                      Solicitar Cambios o Ajustes al Profesional
                    </button>
                    <button type="button" className="py-1 px-3 text-on-surface-variant hover:text-error font-body-sm text-body-sm flex items-center justify-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-[15px]">support_agent</span>
                      Iniciar Mediación PactoPay
                    </button>
                  </div>
                </div>
              </div>

              {/* Liquidation Seal */}
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
                </div>
                <div>
                  <p className="font-label-lg text-label-lg font-bold text-on-surface">Liquidación Instantánea</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Sin retrasos bancarios internacionales ni tasas SWIFT imprevistas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Timeline */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Historial de Seguridad y Movimientos</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Línea de tiempo auditada en lenguaje humano.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md font-semibold bg-secondary-container px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Transmisión Segura
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
              {[
                { step: "Completado", icon: "check", title: "Factura Creada", desc: "19 de Septiembre • Generada por Apex Labs con términos aceptados.", link: "Ver comprobante", color: "bg-secondary text-on-secondary", statusColor: "text-secondary" },
                { step: "Completado", icon: "check", title: "Fondos Depositados", desc: "20 de Septiembre • $ 1.500,00 USDC resguardados en bóveda segura.", badge: "Fondos asegurados", color: "bg-secondary text-on-secondary", statusColor: "text-secondary" },
                { step: "Completado", icon: "check", title: "Trabajo Enviado", desc: "22 de Octubre • Entregables cargados por Fernando May para tu revisión.", badge: "3 archivos anexados", color: "bg-secondary text-on-secondary", statusColor: "text-secondary" },
                { step: "Paso Actual", num: "4", title: "Liberación Final", desc: "Esperando tu confirmación de conformidad para enviar el saldo.", badge: "Acción pendiente requerida", color: "bg-primary text-on-primary animate-pulse", statusColor: "text-primary", active: true },
              ].map((s) => (
                <div key={s.title} className={`relative flex flex-col p-space-md rounded-xl ${s.active ? "bg-surface ring-2 ring-primary/30 shadow-sm" : "bg-surface-container-low"} transition-all`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-7 h-7 rounded-full ${s.color} flex items-center justify-center font-bold text-[13px]`}>
                      {s.icon ? <span className="material-symbols-outlined text-[16px]">{s.icon}</span> : s.num}
                    </span>
                    <span className={`font-label-sm text-label-sm ${s.statusColor} font-bold uppercase`}>{s.step}</span>
                  </div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">{s.title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.desc}</p>
                  {s.link ? (
                    <a className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold mt-3 hover:underline" href="#">
                      <span>{s.link}</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  ) : s.badge ? (
                    <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm ${s.statusColor} font-semibold mt-3`}>
                      <span className="material-symbols-outlined text-[14px]">{s.active ? "pending" : "lock"}</span>
                      {s.badge}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Release Confirmation Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-xl relative">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-space-md shadow-sm">
              <span className="material-symbols-outlined text-[28px]">lock_open</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface">
              ¿Confirmar liberación total?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2">
              Estás a punto de transferir <strong>$ 1.500,00 USDC</strong> a favor de{" "}
              <strong>Fernando May</strong> por el cumplimiento de los 3 hitos del proyecto.
            </p>
            <div className="my-space-md p-space-sm rounded-xl bg-surface-container-low text-body-sm font-body-sm space-y-1">
              <div className="flex justify-between text-on-surface-variant">
                <span>Destinatario:</span>
                <span className="font-bold text-on-surface">Fernando May</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Red de liquidación:</span>
                <span className="font-bold text-on-surface">Stellar Soroban</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="font-bold">Total a transferir:</span>
                <span className="font-bold text-secondary">$ 1.500,00 USDC</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-space-sm mt-space-md">
              <button
                onClick={() => setShowReleaseModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container-high transition-colors"
              >
                Revisar más tarde
              </button>
              <button
                onClick={handleRelease}
                disabled={releasing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {releasing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    Procesando...
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
    </div>
  );
}
