import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Landing } from "./pages/Landing";
import { CrearFactura } from "./pages/CrearFactura";
import { PagarCustodia } from "./pages/PagarCustodia";
import { PanelControl } from "./pages/PanelControl";
import { CumplimientoFiscal } from "./pages/CumplimientoFiscal";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/crear-factura" element={<CrearFactura />} />
        <Route path="/pagar-custodia" element={<PagarCustodia />} />
        <Route path="/panel-de-control" element={<PanelControl />} />
        <Route path="/cumplimiento-fiscal" element={<CumplimientoFiscal />} />
      </Routes>
    </Layout>
  );
}
