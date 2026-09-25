import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { PageSkeleton } from "./components/ui/Skeleton";

const Landing = lazy(() => import("./pages/Landing").then((m) => ({ default: m.Landing })));
const CrearFactura = lazy(() => import("./pages/CrearFactura").then((m) => ({ default: m.CrearFactura })));
const PagarCustodia = lazy(() => import("./pages/PagarCustodia").then((m) => ({ default: m.PagarCustodia })));
const PanelControl = lazy(() => import("./pages/PanelControl").then((m) => ({ default: m.PanelControl })));
const CumplimientoFiscal = lazy(() => import("./pages/CumplimientoFiscal").then((m) => ({ default: m.CumplimientoFiscal })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

export function App() {
  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/crear-factura" element={<CrearFactura />} />
          <Route path="/pagar-custodia" element={<PagarCustodia />} />
          <Route path="/pagar/:escrowId" element={<PagarCustodia />} />
          <Route path="/panel-de-control" element={<PanelControl />} />
          <Route path="/cumplimiento-fiscal" element={<CumplimientoFiscal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}