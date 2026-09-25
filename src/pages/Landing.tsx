import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const FILLED_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

function useCalculator(amount: number) {
  return useMemo(() => {
    const fee = amount * 0.005;
    const swiftInter = 45;
    const swiftReceiving = 25;
    const swiftSpread = amount * 0.035;
    const swiftTotal = amount - swiftInter - swiftReceiving - swiftSpread;
    const pactoTotal = amount - fee;
    const savings = pactoTotal - swiftTotal;

    const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtInt = (v: number) => v.toLocaleString("en-US");

    return {
      displayAmount: fmtInt(amount),
      swiftInter: `~$${fmt(swiftInter)}`,
      swiftSpread: `~$${fmt(swiftSpread)}`,
      swiftTotal: `$${fmt(swiftTotal)}`,
      pactoFee: `$${fmt(fee)}`,
      pactoTotal: `$${fmt(pactoTotal)}`,
      pactoSavings: `+$${fmt(savings)}`,
    };
  }, [amount]);
}

export function Landing() {
  const [amount, setAmount] = useState(2500);
  const calc = useCalculator(amount);

  return (
    <main className="w-full pt-20 bg-surface min-h-screen">
      <div className="flex flex-col w-full overflow-hidden">
        {/* Top Ambient Glow */}
        <div className="relative w-full">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-tr from-surface-tint/15 via-secondary-container/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        </div>

        {/* SECTION 1: HERO */}
        <section className="w-full px-margin-sm lg:px-margin pt-space-lg lg:pt-space-xl pb-space-xl">
          <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1.5 bg-surface-container rounded-full w-fit shadow-sm">
                <span className="text-base leading-none">🛡️</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-normal">
                  Infraestructura de Custodia B2B sobre Stellar • Demo funcional en Testnet
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
                Cobra tus contratos al exterior con la <span className="text-secondary">certeza matemática</span> de recibir tu dinero.
              </h1>

              {/* Subheadline */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                PactoPay protege a freelancers, agencias y exportadores de servicios en América Latina. Tu cliente deposita en custodia programable en dólares digitales (<span className="font-semibold text-on-surface">USDC</span>); los fondos se liberan automáticamente al validar los entregables pactados.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm pt-space-xs">
                <Link
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md rounded-lg shadow-md transition-all active:scale-[0.99] group"
                  to="/crear-factura"
                >
                  <span>Crear Factura Segura Gratis</span>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                </Link>
                <Link
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 bg-surface-container hover:bg-surface-container-high text-primary font-title-md text-title-md rounded-lg shadow-sm transition-colors"
                  to="/pagar-custodia"
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary">play_circle</span>
                  <span>Ver Demo de Pago</span>
                </Link>
              </div>

              {/* Microcopy Checkmarks */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-space-md pt-space-xs text-on-surface-variant font-label-md text-label-md">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                  <span>Sin costos fijos de mantenimiento</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                  <span>Tarifa plana transparente de 0.5%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                  <span>Contrato de custodia desplegado en testnet</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Contract Card Visual */}
            <div className="lg:col-span-5 relative mt-space-md lg:mt-0">
              <div className="absolute -inset-2 bg-gradient-to-tr from-surface-container to-secondary-container/30 rounded-2xl blur-xl opacity-80 -z-10" />
              {/* Live Preview Card */}
              <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden p-space-lg flex flex-col gap-space-md">
                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold tracking-wider uppercase">Contrato Activo</span>
                  </div>
                  <span className="px-space-sm py-1 bg-surface-container rounded-full font-label-sm text-label-sm text-primary font-medium">
                    #PACTO-8492
                  </span>
                </div>

                {/* Counterparty & Project Header */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-title-lg text-title-lg text-on-surface">Diseño &amp; Fullstack UI</span>
                    <span className="font-amount-display text-amount-display text-primary">
                      $3,500<span className="text-title-lg text-on-surface-variant font-normal">.00 USDC</span>
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span>Vertex Labs LLC (San Francisco, EE.UU.)</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    <span className="text-on-surface font-medium">Estudio Croma (Bogotá, CO)</span>
                  </p>
                </div>

                {/* Escrow Protected Chip Bar */}
                <div className="flex items-center justify-between p-space-sm bg-secondary-container/20 rounded-lg">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
                    <span className="font-label-md text-label-md text-secondary font-semibold">Fondos Inmovilizados en Custodia</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant bg-secondary-container px-2 py-0.5 rounded font-bold">
                    100% BLINDADO
                  </span>
                </div>

                {/* Visual Step Progression Track */}
                <div className="flex flex-col gap-space-sm py-space-xs">
                  <div className="flex items-center justify-between text-on-surface font-label-md text-label-md">
                    <span className="font-semibold">Secuencia del Pacto Inteligente</span>
                    <span className="text-secondary font-medium">Hito 2 de 3 Aprobado</span>
                  </div>
                  {/* Steps timeline */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">1. Depósito</span>
                      <span className="text-[10px] leading-tight text-on-surface-variant">Confirmado</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-secondary text-[18px]">rule</span>
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">2. Revisión</span>
                      <span className="text-[10px] leading-tight text-secondary">Aprobado</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-primary-container/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[18px] animate-bounce">lock_open</span>
                      <span className="font-label-sm text-label-sm font-semibold text-primary">3. Liberar</span>
                      <span className="text-[10px] leading-tight text-primary">Listo para cobro</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Button Simulation */}
                <div className="flex flex-col gap-space-xs">
                  <Link
                    className="w-full py-3 bg-secondary hover:bg-secondary/90 text-on-secondary font-title-md text-title-md rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
                    id="heroDemoBtn"
                    to="/pagar-custodia"
                  >
                    <span className="material-symbols-outlined text-[20px]">done_all</span>
                    <span>Probar la custodia en testnet</span>
                  </Link>
                  <p className="text-center font-label-sm text-label-sm text-on-surface-variant pt-1" id="heroFeedback">
                    Demo funcional en Stellar Testnet — verificá cada transacción en el explorer
                  </p>
                </div>

                {/* Ticker metrics bar inside card */}
                <div className="flex items-center justify-between pt-space-xs font-label-sm text-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">bolt</span>
                    Red: <strong>Stellar Testnet</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">analytics</span>
                    Contrato: <strong>verificable en el explorer</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SOCIAL PROOF & STATS BANNER */}
        <section className="w-full bg-surface-container-low py-space-xl">
          <div className="max-w-[1240px] mx-auto px-margin-sm lg:px-margin flex flex-col gap-space-lg">
            {/* Partner Brands Strip */}
            <div className="flex flex-col items-center gap-space-md text-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest font-semibold">
                Integrado con la red Stellar Testnet y billeteras del ecosistema
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-space-xl gap-y-space-md opacity-80">
                <div className="flex items-center gap-1.5 font-title-md text-title-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[22px]">shield</span> Stellar Network
                </div>
                <div className="flex items-center gap-1.5 font-title-md text-title-md text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[22px]">token</span> Freighter / Lobstr
                </div>
              </div>
            </div>

            {/* Live Metrics 4-Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md">
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-secondary">
                  <span className="font-label-sm text-label-sm uppercase font-semibold">Custodia en Testnet</span>
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <span className="font-amount-display text-amount-display text-primary">Demo</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Contrato de custodia desplegado en testnet — verificá cada transacción en el explorer.</p>
              </div>
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-secondary">
                  <span className="font-label-sm text-label-sm uppercase font-semibold">Trazabilidad</span>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <span className="font-amount-display text-amount-display text-primary">Explorer</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cada operación queda registrada on-chain y es pública en Stellar Expert.</p>
              </div>
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-secondary">
                  <span className="font-label-sm text-label-sm uppercase font-semibold">Costo Transparente</span>
                  <span className="material-symbols-outlined text-[20px]">percent</span>
                </div>
                <span className="font-amount-display text-amount-display text-secondary">0.5%</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Comisión plana frente al 5%-8% de SWIFT y pasarelas.</p>
              </div>
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-secondary">
                  <span className="font-label-sm text-label-sm uppercase font-semibold">Marco Fiscal</span>
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <span className="font-amount-display text-amount-display text-primary">5 Países</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cumplimiento nativo SAT, ARCA, SUNAT, DIAN y SII.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CÓMO FUNCIONA EN 3 PASOS */}
        <section className="w-full py-space-xl px-margin-sm lg:px-margin">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-xl">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center gap-space-xs max-w-2xl mx-auto">
              <span className="px-space-sm py-1 bg-surface-container text-primary font-label-md text-label-md font-semibold rounded-full">
                Flujo de Pago sin Fricción
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                ¿Cómo funciona PactoPay?
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Seguridad criptográfica de vanguardia con la experiencia simple y amigable de una aplicación bancaria moderna.
              </p>
            </div>

            {/* 3 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Step 1 Card */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-space-md">
                  <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-title-lg text-title-lg shadow-sm">
                    01
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-title-lg text-title-lg text-on-surface">Generas tu Factura Inteligente</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Defines el monto en USDC, la descripción de entregables y la ventana de revisión (ej. 7 días). Creas un enlace seguro para tu cliente en menos de 30 segundos.
                    </p>
                  </div>
                </div>
                <div className="mt-space-lg p-space-sm bg-surface-container-lowest rounded-lg flex items-center gap-space-xs text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">link</span>
                  <span className="font-label-sm text-label-sm truncate">pactopay.me/pay/inv-8492-secure</span>
                </div>
              </div>

              {/* Step 2 Card */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-space-md">
                  <div className="w-12 h-12 rounded-lg bg-secondary text-on-secondary flex items-center justify-center font-title-lg text-title-lg shadow-sm">
                    02
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-title-lg text-title-lg text-on-surface">Tu cliente asegura el depósito</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      El pagador fondea en USDC desde su billetera Stellar en testnet. El capital queda inmovilizado en un contrato digital de Stellar, blindado e inviolable para ambas partes.
                    </p>
                  </div>
                </div>
                <div className="mt-space-lg p-space-sm bg-surface-container-lowest rounded-lg flex items-center justify-between text-secondary">
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Custodia Activa</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Sin acceso previo</span>
                </div>
              </div>

              {/* Step 3 Card */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-space-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-title-lg text-title-lg shadow-sm">
                    03
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-title-lg text-title-lg text-on-surface">Entregas el trabajo y liberas</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Al verificar los entregables o expirar la ventana sin objeciones, el 100% se libera a tu billetera Stellar en testnet, con cada paso visible en el explorer.
                    </p>
                  </div>
                </div>
                <div className="mt-space-lg p-space-sm bg-surface-container-lowest rounded-lg flex items-center justify-between text-on-surface">
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    <span>Acreditado en billetera testnet</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">Verificable on-chain</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CALCULADORA DE AHORRO INTERACTIVA */}
        <section className="w-full bg-surface-container-low py-space-xl px-margin-sm lg:px-margin">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col items-center text-center gap-space-xs max-w-xl mx-auto">
              <span className="px-space-sm py-1 bg-surface-container text-secondary font-label-md text-label-md font-semibold rounded-full">
                Transparencia de Costos
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Calcula tu ahorro real frente a la banca tradicional
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Compara lo que recibes por transferencias SWIFT o plataformas intermediarias contra el 0.5% plano de PactoPay.
              </p>
            </div>

            {/* Calculator Card */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg lg:p-space-xl flex flex-col gap-space-lg max-w-4xl mx-auto w-full">
              {/* Slider Input Container */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <label className="font-title-md text-title-md text-on-surface" htmlFor="amountRange">
                    Monto a cobrar al exterior:
                  </label>
                  <div className="flex items-center gap-1 bg-surface-container px-space-md py-1.5 rounded-lg">
                    <span className="font-label-lg text-label-lg text-on-surface-variant font-semibold">$</span>
                    <span className="font-title-lg text-title-lg text-primary font-bold">
                      {calc.displayAmount}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">USDC</span>
                  </div>
                </div>
                <input
                  className="w-full h-2.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  id="amountRange"
                  max="25000"
                  min="500"
                  step="100"
                  type="range"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>$500 USD</span>
                  <span>$10,000 USD</span>
                  <span>$25,000 USD</span>
                </div>
              </div>

              {/* Comparison Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-sm">
                {/* Column A: Traditional SWIFT */}
                <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-space-md">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface font-semibold">Banca Tradicional / SWIFT</span>
                      <span className="material-symbols-outlined text-outline text-[20px]">account_balance</span>
                    </div>
                    <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                      <div className="flex justify-between">
                        <span>Costo bancos intermediarios</span>
                        <span className="font-medium text-on-surface">{calc.swiftInter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comisión banco receptor local</span>
                        <span className="font-medium text-on-surface">~$25.00 USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spread cambiario desfavorable (~3.5%)</span>
                        <span className="font-medium text-on-surface">{calc.swiftSpread}</span>
                      </div>
                      <div className="flex justify-between text-outline">
                        <span>Tiempo de acreditación</span>
                        <span>4 a 7 días hábiles</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-sm bg-surface-container-highest/60 -mx-space-md -mb-space-md p-space-md rounded-b-xl flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Dinero total recibido:</span>
                      <div className="font-title-lg text-title-lg text-on-surface font-bold">{calc.swiftTotal}</div>
                    </div>
                    <span className="px-2 py-1 bg-surface-container rounded text-error font-label-sm text-label-sm font-semibold">Pierdes ~6.3%</span>
                  </div>
                </div>

                {/* Column B: PactoPay */}
                <div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between gap-space-md relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-space-sm py-0.5 rounded-bl-lg font-label-sm text-label-sm font-bold">
                    RECOMENDADO
                  </div>
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
                      <span className="font-title-md text-title-md text-primary font-bold">PactoPay (Custodia)</span>
                    </div>
                    <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                      <div className="flex justify-between">
                        <span>Comisión PactoPay (0.5% plano)</span>
                        <span className="font-medium text-on-surface">{calc.pactoFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Costo de red Stellar</span>
                        <span className="font-medium text-secondary font-semibold">$0.00 USD (Bonificado)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spread en moneda local</span>
                        <span className="font-medium text-on-surface-variant font-semibold">No incluido en la demo de testnet</span>
                      </div>
                      <div className="flex justify-between text-secondary">
                        <span>Tiempo de liquidación</span>
                        <span className="font-bold">Tiempos de la red de prueba</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-sm bg-surface-container-lowest -mx-space-md -mb-space-md p-space-md rounded-b-xl flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Dinero total recibido:</span>
                      <div className="font-title-lg text-title-lg text-primary font-bold">{calc.pactoTotal}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">Ahorras</span>
                      <span className="font-title-md text-title-md text-secondary font-bold">{calc.pactoSavings}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: CASOS DE USO PRINCIPALES */}
        <section className="w-full py-space-xl px-margin-sm lg:px-margin">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-xl">
            <div className="flex flex-col items-center text-center gap-space-xs max-w-xl mx-auto">
              <span className="px-space-sm py-1 bg-surface-container text-primary font-label-md text-label-md font-semibold rounded-full">
                Soluciones a Medida
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Diseñado para el ecosistema productivo de LATAM
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Desde creadores individuales hasta empresas multinacionales contratando talento en la región.
              </p>
            </div>

            {/* Bento Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Freelancers */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
                <div className="flex flex-col gap-space-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">terminal</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-title-lg text-title-lg text-on-surface">Freelancers y Contratistas Tech</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Desarrolladores, diseñadores UX y consultores que no quieren comenzar a trabajar sin certeza de pago ni sufrir clientes que desaparecen al entregar el código final.
                    </p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 pt-space-md font-body-sm text-body-sm text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                    <span>Garantía de cobro antes de escribir una línea</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                    <span>Retiro en moneda local sin restricciones</span>
                  </li>
                </ul>
              </div>

              {/* Agencies */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
                <div className="flex flex-col gap-space-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">hub</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-title-lg text-title-lg text-on-surface">Agencias &amp; Software Factories</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Gestión de hitos escalonados para contratos de $5,000 a $50,000 USD. Asegura flujo de caja predecible con entregas quincenales validadas sin fricción contable.
                    </p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 pt-space-md font-body-sm text-body-sm text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                    <span>Custodia multi-hito simultánea</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                    <span>Emisión de facturas comerciales auditables</span>
                  </li>
                </ul>
              </div>

              {/* Foreign Hirers */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
                <div className="flex flex-col gap-space-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-title-lg text-title-lg text-on-surface">Empresas en EE.UU. &amp; Europa</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Compañías internacionales que requieren comprobantes deducibles para el IRS/Europa y prefieren no anticipar el 100% del pago a ciegas a proveedores remotos.
                    </p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 pt-space-md font-body-sm text-body-sm text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                    <span>Ventana de inspección de calidad protegida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                    <span>Pago con tarjeta corporativa o ACH directo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: SEGURIDAD, CUSTODIA Y CUMPLIMIENTO REGULATORIO */}
        <section className="w-full bg-surface-container-low py-space-xl px-margin-sm lg:px-margin">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <span className="px-space-sm py-1 bg-surface-container text-secondary font-label-md text-label-md font-semibold rounded-full w-fit">
                  Arquitectura de Confianza
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Validez legal estricta y blindaje criptográfico
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  PactoPay no es un monedero informal. Es un protocolo de custodia respaldado por la inmutabilidad de Stellar y diseñado en concordancia con las normativas tributarias de cada país de América Latina.
                </p>
                <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-space-md">
                  <span className="material-symbols-outlined text-primary text-[32px]">balance</span>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface">Resolución Objetiva de Disputas</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Períodos pactados de revisión (7, 14 o 30 días) y peritaje neutral de entregables.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[28px]">lock_clock</span>
                  <h3 className="font-title-lg text-title-lg text-on-surface">Custodia Criptográfica en Stellar</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    No retenemos discrecionalmente tu dinero. Los fondos son custodiados por contratos inteligentes de código abierto con ejecución condicionada a la firma mutua.
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[28px]">receipt_long</span>
                  <h3 className="font-title-lg text-title-lg text-on-surface">Facturación y Compliance LATAM</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Genera documentos tributarios válidos para exportación de servicios: CFDI 4.0 (SAT México), Factura E (ARCA Argentina), SUNAT (Perú) y RADIAN (Colombia).
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[28px]">security</span>
                  <h3 className="font-title-lg text-title-lg text-on-surface">Protección Anti-Chargeback</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Al depositar en custodia verificada, se eliminan los contracargos maliciosos habituales de plataformas de pago como PayPal o Stripe.
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[28px]">currency_exchange</span>
                  <h3 className="font-title-lg text-title-lg text-on-surface">Registro On-Chain Verificable</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Cada movimiento de la custodia queda registrado en el contrato de testnet y puede verificarse transacción por transacción en el explorer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: TESTIMONIOS REALES LATAM */}
        <section className="w-full py-space-xl px-margin-sm lg:px-margin">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-xl">
            <div className="flex flex-col items-center text-center gap-space-xs max-w-xl mx-auto">
              <span className="px-space-sm py-1 bg-surface-container text-primary font-label-md text-label-md font-semibold rounded-full">
                Experiencias Reales
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Profesionales que ya cobran con tranquilidad total
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Exportadores de servicios de toda la región que transformaron su relación comercial con clientes extranjeros.
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Card 1: Argentina */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between gap-space-lg shadow-sm">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex text-secondary">
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface italic">
                    "Antes vivía con la angustia de enviar el trabajo terminado antes de recibir el saldo. Con la custodia de PactoPay, el depósito queda registrado en testnet desde el día cero."
                  </p>
                </div>
                <div className="flex items-center gap-space-sm pt-space-sm">
                  <img className="w-11 h-11 rounded-full object-cover shadow-xs" alt="Mariano Sforza" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC8X_g3MBWYYiSeSxnoPAtoA2Nx1iLdRoCHAjfuPQ7CgSSAAlUKfwF7bvndbvCvEymMAkobH03o-Nvp96rmcmDYiWpRcWL2FsBwfceMPCpR4gr5VygT_P4ccrUzl7Uh6VaYBayLh8Zs1DG4pZJuaDZBsxVqROKnIaJOSduU_ti2x2YyXet9oZ7aXyg6KjVbYH7jIkxgy7s2x18h7KDeXTqoSkw4wokyLiYd_iMyhuEpCW-XNRUvU-4" />
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface">Mariano Sforza</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Senior Fullstack Dev • Buenos Aires, AR 🇦🇷</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Colombia */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between gap-space-lg shadow-sm">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex text-secondary">
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface italic">
                    "Para nuestra agencia en Medellín gestionar contratos con clientes en California era un reto burocrático enorme. Ahora creamos los hitos de entrega en PactoPay y el flujo se sigue en testnet sin fricciones."
                  </p>
                </div>
                <div className="flex items-center gap-space-sm pt-space-sm">
                  <img className="w-11 h-11 rounded-full object-cover shadow-xs" alt="Camila Restrepo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdHNj8cebhHQnUuQB3y2VgtPLQuO0ceaiZK4moUhEJ17gu38CW4SeItIhdVxpTMY-NKzLqMDIHHoD9lfCYSOnZ1P7yNR2AgngzS5H0tNJBeFSKEgxS0mbrrLYLFhl0Y7zz8MsC8E6de015XIab9eKIvz6UM_LB2ywHIfhPPrB67Pwk0ZGAmGstbriYZlyeCDnIbXlzpD62PqalFWAzpIPK7gPZZZR_7CkI-P4TXYNnRVE724M5_jyw" />
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface">Camila Restrepo</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Directora en Novus Agency • Medellín, CO 🇨🇴</span>
                  </div>
                </div>
              </div>

              {/* Card 3: México */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between gap-space-lg shadow-sm">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex text-secondary">
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                    <span className="material-symbols-outlined text-[20px]" style={FILLED_STYLE}>star</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface italic">
                    "El panel nos ordenó el dolor de cabeza fiscal: el cliente fondea en USDC en testnet y nosotros generamos el comprobante y seguimos la custodia desde un solo lugar."
                  </p>
                </div>
                <div className="flex items-center gap-space-sm pt-space-sm">
                  <img className="w-11 h-11 rounded-full object-cover shadow-xs" alt="Alejandro Morales" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVlzdhqAP90NM7FE9T42ors53m-ZLRzM-HM5hmXzi0cskriLxflUrhBK6D0RqbdyxIEAfBx1e02J29i6TI7Jyq3qWeXrwsBgxF6c9o93JS9EQPeLk2mniRzYI6r1BevYTqnLW02mW4i3cQtWFbeRMNS_tGAAVW7pTnBzZu9dzsJx7TUFpTyXEuLx5xJKFbRFxdAvjcMb_jPu0TuYpRnzxxm1LRC31SCtIbi_40tzeQ6flTZRMOanbw" />
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface">Alejandro Morales</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Lead Product Designer • CDMX, MX 🇲🇽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: FINAL CONVERTING CTA BLOCK */}
        <section className="w-full pb-space-xl px-margin-sm lg:px-margin">
          <div className="max-w-[1240px] mx-auto bg-primary text-on-primary rounded-2xl p-space-xl relative overflow-hidden shadow-xl flex flex-col items-center text-center gap-space-lg">
            {/* Subtle background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-space-xs max-w-2xl">
              <span className="px-space-sm py-1 bg-surface-container-highest/20 text-on-primary-container font-label-md text-label-md font-semibold rounded-full">
                Cero Riesgo de Impago
              </span>
              <h2 className="font-headline-lg text-headline-lg tracking-tight">
                ¿Listo para nunca más volver a cobrar con miedo a no recibir tu dinero?
              </h2>
              <p className="font-body-lg text-body-lg text-primary-fixed-dim pt-space-xs">
                Comienza en 2 minutos. Crea tu primer contrato inteligente de cobro sin comisiones fijas ni papeleo engorroso.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-sm">
              <Link
                className="w-full sm:w-auto px-space-xl py-3.5 bg-secondary text-on-secondary hover:bg-secondary/90 font-title-md text-title-md rounded-lg shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                to="/crear-factura"
              >
                <span>Comenzar a Facturar con Custodia</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <Link
                className="w-full sm:w-auto px-space-xl py-3.5 bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-title-md text-title-md rounded-lg transition-colors flex items-center justify-center gap-2"
                to="/panel-de-control"
              >
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                <span>Ver Panel de Custodia</span>
              </Link>
            </div>

            <div className="relative z-10 flex items-center gap-space-md text-primary-fixed-dim font-label-sm text-label-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                Cumplimiento KYC &amp; AML activo
              </span>
              <span>•</span>
              <span>Soporte prioritario en español</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
