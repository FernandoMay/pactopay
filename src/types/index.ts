export interface Invoice {
  id: string;
  clientEmail: string;
  clientName: string;
  amount: number;
  concept: string;
  term: string;
  status: "draft" | "pending_deposit" | "funded" | "in_review" | "released" | "disputed";
  createdAt: string;
  milestones: Milestone[];
  contractAddress?: string;
  txHash?: string;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: "pending" | "submitted" | "approved" | "disputed";
  approvedAt?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface WalletInfo {
  address: string;
  network: "testnet" | "mainnet";
  balance?: number;
}

export interface TaxCertificate {
  id: string;
  invoiceId: string;
  contractHash: string;
  beneficiary: string;
  payer: string;
  entity: string;
  amount: number;
  status: "signed" | "sent" | "pending";
  createdAt: string;
}

export type TaxEntity = "SAT" | "ARCA" | "SUNAT" | "DIAN" | "SII";

export interface CountryRegulatory {
  country: string;
  flag: string;
  entity: string;
  regime: string;
  status: "homologado" | "en_plazos" | "inafecto";
  details: string[];
  certificates: number;
}
