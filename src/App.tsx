import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { CrearFactura } from "./pages/CrearFactura";
import { PagarCustodia } from "./pages/PagarCustodia";
import { PanelControl } from "./pages/PanelControl";
import { CumplimientoFiscal } from "./pages/CumplimientoFiscal";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/crear-factura" replace />} />
        <Route path="/crear-factura" element={<CrearFactura />} />
        <Route path="/pagar-custodia" element={<PagarCustodia />} />
        <Route path="/panel-de-control" element={<PanelControl />} />
        <Route path="/cumplimiento-fiscal" element={<CumplimientoFiscal />} />
      </Routes>
    </Layout>
  );
}
