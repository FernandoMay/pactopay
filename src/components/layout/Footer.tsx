export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_6px_rgba(0,0,0,0.02)] mt-auto">
      <div className="max-w-7xl mx-auto px-gutter py-space-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                verified_user
              </span>
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Garantía y Cumplimiento Institucional
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
              PactoPay © 2025. Plataforma de pagos internacionales y custodia protegida en
              Stellar. Sin comisiones ocultas.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <a className="hover:text-on-surface transition-colors" href="#">
              Términos de Servicio
            </a>
            <span className="text-outline-variant">•</span>
            <a className="hover:text-on-surface transition-colors" href="#">
              Privacidad y Seguridad
            </a>
            <span className="text-outline-variant">•</span>
            <a className="hover:text-on-surface transition-colors" href="#">
              Cómo Funciona la Custodia
            </a>
            <span className="text-outline-variant">•</span>
            <a
              className="hover:text-on-surface transition-colors inline-flex items-center gap-1"
              href="https://stellar.expert"
              rel="noopener noreferrer"
              target="_blank"
            >
              Ver en Stellar Explorer
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
