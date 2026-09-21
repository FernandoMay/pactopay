# PactoPay — Stellar USDC Escrow for LATAM Freelancers

> Argentina Builder Challenge — Multi-country fiscal compliance + Stellar escrow platform

## Architecture

```
pactopay/
├── contracts/escrow/          ← Soroban smart contract (Rust)
│   ├── Cargo.toml
│   └── src/lib.rs             ← Escrow + milestones + release logic
├── src/
│   ├── lib/
│   │   ├── contract.ts        ← Frontend ↔ contract bridge (demo + on-chain)
│   │   ├── stellar.ts         ← Stellar SDK + Freighter wallet
│   │   └── format.ts          ← LATAM currency formatting
│   ├── components/
│   │   ├── layout/            ← Header, Footer, Layout
│   │   ├── wallet/            ← Freighter wallet connection
│   │   └── ui/                ← Modal, shared components
│   ├── pages/
│   │   ├── CrearFactura.tsx   ← Invoice builder + live preview
│   │   ├── PagarCustodia.tsx  ← Escrow checkout flow
│   │   ├── PanelControl.tsx   ← Dashboard + milestone management
│   │   └── CumplimientoFiscal.tsx ← Tax compliance (5 LATAM countries)
│   └── types/
│       └── index.ts           ← TypeScript types
└── package.json
```

## Smart Contract

The Soroban escrow contract (`contracts/escrow/src/lib.rs`) supports:

- **Create escrow** — Payer and contractor establish an agreement
- **Add milestones** — Break work into payable units
- **Fund escrow** — Deposit USDC to lock funds
- **Approve milestone** — Payer confirms work completion
- **Release milestone** — Funds transferred to contractor
- **Open dispute** — Flag a milestone for resolution
- **Refund escrow** — Return funds to payer (disputed only)

### Deploy the contract

```bash
# Install Soroban CLI
cargo install soroban-cli

# Build the contract
cd contracts/escrow
soroban contract build

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pactopay_escrow.wasm \
  --source admin \
  --network testnet
```

After deploy, update `src/lib/contract.ts`:
```typescript
const DEMO_MODE = false;
const CONTRACT_ADDRESS = "<your-deployed-contract-address>";
```

## Frontend

### Run development server

```bash
npm install
npm run dev    # http://localhost:3000
```

### Build for production

```bash
npm run build  # Output in dist/
```

### Wallet Connection

Requires [Freighter](https://freighter.app) browser extension for Stellar.
The app connects to Stellar testnet by default.

## Countries Covered

| Country | Tax Entity | Invoice Type | Status |
|---------|-----------|--------------|--------|
| 🇲🇽 México | SAT | CFDI 4.0 | Homologado |
| 🇦🇷 Argentina | ARCA | Factura E | En plazos |
| 🇵🇪 Perú | SUNAT | RHE | Inafecto IGV |
| 🇨🇴 Colombia | DIAN | Factura Exp. Tipo 02 | Homologado |
| 🇨🇱 Chile | SII | FEE Tipo 110 | Exento IVA |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Blockchain:** Stellar, Soroban, @stellar/stellar-sdk
- **Wallet:** Freighter (browser extension)
- **Design:** Material Design 3-inspired custom theme

## Deploy

Vercel, Netlify, or Cloudflare Pages:
1. Push to GitHub
2. Import repository
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add SPA fallback: `index.html`
