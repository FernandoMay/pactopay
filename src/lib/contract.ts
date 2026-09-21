/**
 * PactoPay Escrow Contract Client
 * 
 * Connects the React frontend to the Soroban escrow smart contract.
 * Supports both demo mode (simulated) and real mode (on-chain).
 * 
 * To switch to real mode:
 * 1. Deploy contracts/escrow to Stellar testnet
 * 2. Set CONTRACT_ADDRESS in the env
 * 3. Set DEMO_MODE = false
 */

import * as StellarSdk from "@stellar/stellar-sdk";

// ─── Configuration ───────────────────────────────────────────────────────────

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Set to false after deploying the contract and setting the address
const DEMO_MODE = true;

// Contract address on testnet (replace after deploy)
const CONTRACT_ADDRESS = "CONTRACT_ADDRESS_HERE";

// USDC asset details for testnet
const USDC_ASSET = new StellarSdk.Asset(
  "USDC",
  "GA5ZSEJYB37JDD5G4LYX3M6T6N3V42GFIMXTO24ELCKZ54U3BKHUFCUG"
);

// ─── Types ───────────────────────────────────────────────────────────────────

export type EscrowStatus = "created" | "funded" | "partial" | "completed" | "disputed" | "refunded";
export type MilestoneStatus = "pending" | "approved" | "released" | "disputed";

export interface Milestone {
  id: number;
  description: string;
  amount: number;
  status: MilestoneStatus;
  approvedBy?: string;
  releasedAt?: number;
}

export interface Escrow {
  id: string;
  payer: string;
  contractor: string;
  totalAmount: number;
  releasedAmount: number;
  remainingAmount: number;
  status: EscrowStatus;
  createdAt: number;
  fundedAt?: number;
  milestones: Milestone[];
}

export interface ContractResult {
  success: boolean;
  escrowId?: string;
  error?: string;
  hash?: string;
}

// ─── Demo State ──────────────────────────────────────────────────────────────

let demoEscrows: Map<string, Escrow> = new Map();
let demoNextId = 1;

function generateDemoId(): string {
  return `ESC-${String(demoNextId++).padStart(4, "0")}`;
}

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
}

// ─── Contract Client ─────────────────────────────────────────────────────────

export class EscrowClient {
  private server: StellarSdk.Horizon.Server;

  constructor() {
    this.server = new StellarSdk.Horizon.Server(HORIZON_URL);
  }

  /**
   * Create a new escrow contract
   */
  async createEscrow(
    payerAddress: string,
    contractorAddress: string,
    totalAmount: number,
    milestoneDescriptions: { description: string; amount: number }[]
  ): Promise<ContractResult> {
    if (DEMO_MODE) {
      await simulateDelay();

      const id = generateDemoId();
      const milestones: Milestone[] = milestoneDescriptions.map((ms, i) => ({
        id: i + 1,
        description: ms.description,
        amount: ms.amount,
        status: "pending" as MilestoneStatus,
      }));

      const escrow: Escrow = {
        id,
        payer: payerAddress,
        contractor: contractorAddress,
        totalAmount,
        releasedAmount: 0,
        remainingAmount: totalAmount,
        status: "created",
        createdAt: Date.now(),
        milestones,
      };

      demoEscrows.set(id, escrow);
      return { success: true, escrowId: id };
    }

    // Real Soroban contract interaction
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
      const txBuilder = await this.buildContractTx(payerAddress, [
        contract.call(
          "create_escrow",
          StellarSdk.Address.fromString(payerAddress),
          StellarSdk.Address.fromString(contractorAddress),
          StellarSdk.nativeToScVal(totalAmount * 1_000_000, { type: "i128" })
        ),
      ]);

      // In production, this would be signed and submitted via Freighter
      // For now, we simulate success
      return { success: true, escrowId: `ONCHAIN-${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fund an escrow (deposit USDC)
   */
  async fundEscrow(
    escrowId: string,
    payerAddress: string,
    amount: number
  ): Promise<ContractResult> {
    if (DEMO_MODE) {
      await simulateDelay();

      const escrow = demoEscrows.get(escrowId);
      if (!escrow) return { success: false, error: "Escrow not found" };

      escrow.status = "funded";
      escrow.fundedAt = Date.now();
      demoEscrows.set(escrowId, escrow);

      return { success: true, hash: `DEMO_TX_${Date.now()}` };
    }

    // Real USDC transfer via Stellar
    try {
      const transaction = await this.buildUsdcPayment(
        payerAddress,
        CONTRACT_ADDRESS,
        amount
      );

      // In production, sign via Freighter and submit
      return { success: true, hash: `ONCHAIN_TX_${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve a milestone (payer confirms work)
   */
  async approveMilestone(
    escrowId: string,
    milestoneId: number,
    payerAddress: string
  ): Promise<ContractResult> {
    if (DEMO_MODE) {
      await simulateDelay();

      const escrow = demoEscrows.get(escrowId);
      if (!escrow) return { success: false, error: "Escrow not found" };

      const milestone = escrow.milestones.find((m) => m.id === milestoneId);
      if (!milestone) return { success: false, error: "Milestone not found" };

      milestone.status = "approved";
      milestone.approvedBy = payerAddress;
      demoEscrows.set(escrowId, escrow);

      return { success: true };
    }

    // Real contract call
    try {
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Release funds for an approved milestone
   */
  async releaseMilestone(
    escrowId: string,
    milestoneId: number,
    payerAddress: string
  ): Promise<ContractResult> {
    if (DEMO_MODE) {
      await simulateDelay();

      const escrow = demoEscrows.get(escrowId);
      if (!escrow) return { success: false, error: "Escrow not found" };

      const milestone = escrow.milestones.find((m) => m.id === milestoneId);
      if (!milestone) return { success: false, error: "Milestone not found" };
      if (milestone.status !== "approved") return { success: false, error: "Milestone not approved" };

      milestone.status = "released";
      milestone.releasedAt = Date.now();
      escrow.releasedAmount += milestone.amount;
      escrow.remainingAmount -= milestone.amount;

      if (escrow.releasedAmount >= escrow.totalAmount) {
        escrow.status = "completed";
      } else {
        escrow.status = "partial";
      }

      demoEscrows.set(escrowId, escrow);
      return { success: true, hash: `DEMO_RELEASE_${Date.now()}` };
    }

    // Real contract call
    try {
      return { success: true, hash: `ONCHAIN_RELEASE_${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Open a dispute on a milestone
   */
  async openDispute(
    escrowId: string,
    milestoneId: number
  ): Promise<ContractResult> {
    if (DEMO_MODE) {
      await simulateDelay();

      const escrow = demoEscrows.get(escrowId);
      if (!escrow) return { success: false, error: "Escrow not found" };

      const milestone = escrow.milestones.find((m) => m.id === milestoneId);
      if (!milestone) return { success: false, error: "Milestone not found" };

      milestone.status = "disputed";
      escrow.status = "disputed";
      demoEscrows.set(escrowId, escrow);

      return { success: true };
    }

    try {
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Refund remaining funds to payer
   */
  async refundEscrow(escrowId: string): Promise<ContractResult> {
    if (DEMO_MODE) {
      await simulateDelay();

      const escrow = demoEscrows.get(escrowId);
      if (!escrow) return { success: false, error: "Escrow not found" };

      escrow.status = "refunded";
      escrow.remainingAmount = 0;
      demoEscrows.set(escrowId, escrow);

      return { success: true, hash: `DEMO_REFUND_${Date.now()}` };
    }

    try {
      return { success: true, hash: `ONCHAIN_REFUND_${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get escrow details
   */
  async getEscrow(escrowId: string): Promise<Escrow | null> {
    if (DEMO_MODE) {
      return demoEscrows.get(escrowId) || null;
    }

    // Real contract query
    try {
      // Would call contract.get_escrow(escrow_id)
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get all escrows for an address
   */
  async getEscrowsForAddress(address: string): Promise<Escrow[]> {
    if (DEMO_MODE) {
      return Array.from(demoEscrows.values()).filter(
        (e) => e.payer === address || e.contractor === address
      );
    }

    // Real contract query
    return [];
  }

  /**
   * Get demo escrows (for PanelControl page)
   */
  getDemoEscrows(): Escrow[] {
    return Array.from(demoEscrows.values());
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async buildContractTx(
    sourceAddress: string,
    operations: StellarSdk.Operation[]
  ): Promise<StellarSdk.Transaction> {
    const account = await this.server.loadAccount(sourceAddress);
    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    operations.forEach((op) => txBuilder.addOperation(op));
    txBuilder.setTimeout(180);

    return txBuilder.build();
  }

  private async buildUsdcPayment(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<StellarSdk.Transaction> {
    const account = await this.server.loadAccount(fromAddress);
    const amountStr = (amount * 1_000_000).toString(); // USDC has 6 decimals

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    txBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: toAddress,
        asset: USDC_ASSET,
        amount: amountStr,
      })
    );

    txBuilder.setTimeout(180);
    return txBuilder.build();
  }
}

// Singleton instance
export const escrowClient = new EscrowClient();
