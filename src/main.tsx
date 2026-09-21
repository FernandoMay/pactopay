import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { WalletProvider } from "./components/wallet/WalletProvider";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[36px] text-error">error</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
            Algo salió mal
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
            {this.state.error?.message || "Ocurrió un error inesperado. Probá recargar la página."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-title-md text-title-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Recargar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <WalletProvider>
          <App />
        </WalletProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);