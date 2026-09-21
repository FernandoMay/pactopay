import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-gutter text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-space-lg">
        <span className="material-symbols-outlined text-[48px] text-primary">search_off</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-sm">
        404 — Página no encontrada
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mb-space-lg">
        La página que buscás no existe o fue movida. Volvé al inicio o explorá nuestras funcionalidades.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-space-sm">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md rounded-lg shadow-md transition-all active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Volver al Inicio
        </Link>
        <Link
          to="/crear-factura"
          className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 bg-surface-container hover:bg-surface-container-high text-primary font-title-md text-title-md rounded-lg shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">description</span>
          Crear Factura
        </Link>
      </div>
    </div>
  );
}
