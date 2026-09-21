/**
 * PactoPay Escrow Contract Client
 *
 * Real Soroban smart contract integration using @stellar/stellar-sdk.
 * All transactions are built, simulated, signed via Freighter, and submitted on-chain.
 *
 * Deployed contract: CCADBBE7UC2TWIWT634L76YSQ5NF65ZK7E7QLLCTUDG5X77VRHN7ITFQ
 * Explorer: https://stellar.expert/explorer/testnet/contract/CCADBBE7UC2TWIWT634L76YSQ5NF65ZK7E7QLLCTUDG5X77VRHN7ITFQ
 */

import {
  Contract,
  Address,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  StrKey,
  rpc,
  Horizon,
} from "@stellar/stellar-sdk";

// ─── Configuration ───────────────────────────────────────────────────────────

/** Deployed Soroban escrow contract on Stellar testnet */
const CONTRACT_ADDRESS =
  "CCADBBE7UC2TWIWT634L76YSQ5NF65ZK7E7QLLCTUDG5X77VRHN7ITFQ";

/** Soroban RPC endpoint for contract simulations and submissions */
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

/** Horizon endpoint for account/transaction queries */
const HORIZON_URL = "https://horizon-testnet.stellar.org";

/** Network passphrase for Stellar testnet */
const NETWORK_PASSPHRASE = Networks.TESTNET;

// ─── Types ───────────────────────────────────────────────────────────────────

export type EscrowStatus =
  | "created"
  | "funded"
  | "partial"
  | "completed"
  | "disputed"
  | "refunded";

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

// ─── Status Mappings ────────────────────────────────────────────────────────

/** Maps on-chain u32 status index → frontend EscrowStatus string */
const ESCROW_STATUS_MAP: EscrowStatus[] = [
  "created",
  "funded",
  "partial",
  "completed",
  "disputed",
  "refunded",
];

/** Maps on-chain u32 status index → frontend MilestoneStatus string */
const MILESTONE_STATUS_MAP: MilestoneStatus[] = [
  "pending",
  "approved",
  "released",
  "disputed",
];

// ─── Server Helpers ─────────────────────────────────────────────────────────

/** Get the Soroban RPC server instance */
function getRpcServer(): rpc.Server {
  return new rpc.Server(SOROBAN_RPC_URL);
}

/** Get the Horizon server instance */
function getHorizonServer(): Horizon.Server {
  return new Horizon.Server(HORIZON_URL);
}

// ─── Freighter Helpers ──────────────────────────────────────────────────────

/** Check if Freighter is installed in the browser */
function isFreighterAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).freighter;
}

/** Get the Freighter wallet instance — throws if not installed */
function getFreighter(): any {
  if (!isFreighterAvailable()) {
    throw new Error(
      "Freighter wallet not installed. Install it from freighter.app"
    );
  }
  return (window as any).freighter;
}

// ─── ScVal Encoding Helpers ─────────────────────────────────────────────────

/** Convert a Stellar address (G… or C…) to an ScVal */
function addressToScVal(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

/** Convert a JS string to an ScVal string */
function stringToScVal(value: string): xdr.ScVal {
  return xdr.ScVal.scvString(value);
}

/** Convert a JS number to an ScVal u32 */
function u32ToScVal(value: number): xdr.ScVal {
  return xdr.ScVal.scvU32(value);
}

/** Convert a JS number/bigint to an ScVal u64 */
function u64ToScVal(value: number | bigint): xdr.ScVal {
  return xdr.ScVal.scvU64(xdr.Uint64.fromString(String(Math.floor(Number(value)))));
}

// ─── ScVal Decoding ─────────────────────────────────────────────────────────

/**
 * Recursively decode an xdr.ScVal into a native JavaScript value.
 *
 * Handles all common Soroban types: booleans, integers, strings, addresses,
 * vectors, maps, and voids. Unknown types fall back to base64 XDR.
 */
function scValToNative(val: xdr.ScVal): any {
  switch (val.switch().name) {
    case "scvBool":
      return val.b();

    case "scvU32":
      return val.u32();

    case "scvI32":
      return val.i32();

    case "scvU64":
      return Number(val.u64());

    case "scvI64":
      return Number(val.i64());

    case "scvU128":
      return val.u128().toString();

    case "scvI128":
      return val.i128().toString();

    case "scvString":
      return val.str();

    case "scvBytes":
      return val.bytes().toString();

    case "scvSymbol":
      return val.sym().toString();

    case "scvAddress": {
      const addr = val.address();
      if (addr.switch().name === "scAddressTypeAccount") {
        return StrKey.encodeEd25519PublicKey(addr.accountId().ed25519());
      }
      return StrKey.encodeContract(addr.contractId());
    }

    case "scvVec":
      return val.vec()?.map(scValToNative) ?? [];

    case "scvMap":
      return (
        val.map()?.reduce((obj: any, entry: xdr.ScMapEntry) => {
          obj[scValToNative(entry.key())] = scValToNative(entry.val());
          return obj;
        }, {}) ?? {}
      );

    case "scvVoid":
      return null;

    default:
      // Fallback: return raw XDR as base64
      return val.toXDR("base64");
  }
}

// ─── Transaction Helpers ────────────────────────────────────────────────────

/**
 * Full Soroban write flow: build → prepare (simulate + attach soroban data) →
 * sign via Freighter → submit to Soroban RPC → poll for confirmation.
 *
 * Returns a `ContractResult` with the transaction hash on success.
 */
async function buildSignAndSubmit(
  sourceAddress: string,
  buildOp: (contract: Contract) => xdr.Operation
): Promise<ContractResult> {
  try {
    const rpcServer = getRpcServer();
    const horizonServer = getHorizonServer();
    const contract = new Contract(CONTRACT_ADDRESS);
    const freighter = getFreighter();

    // Load the source account from Horizon (provides sequence number)
    const account = await horizonServer.loadAccount(sourceAddress);

    // Build the initial transaction with the contract call operation
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(buildOp(contract))
      .setTimeout(300)
      .build();

    // prepareTransaction simulates the tx, then attaches soroban data
    // (resource limits, footprint, authorizations) and adjusts the fee.
    // If the simulation fails, prepareTransaction throws automatically.
    const preparedTx = await rpcServer.prepareTransaction(tx);

    // Sign the prepared transaction with Freighter
    const signedXdr = await freighter.signTransaction(preparedTx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Deserialize the signed XDR back into a Transaction
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

    // Submit to the Soroban RPC node
    const sendResponse = await rpcServer.sendTransaction(signedTx);

    if (sendResponse.status === "ERROR") {
      // errorResult is an xdr.TransactionResult; try to extract a message
      const errMsg = sendResponse.errorResult
        ? sendResponse.errorResult.toString()
        : "unknown error";
      throw new Error(`Transaction submission failed: ${errMsg}`);
    }

    // Poll for on-chain confirmation (testnet typically confirms in ~5 s)
    let txResponse = await rpcServer.getTransaction(sendResponse.hash);
    let retries = 0;
    const maxRetries = 60; // 60 s max wait

    while (txResponse.status === "NOT_FOUND" && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      txResponse = await rpcServer.getTransaction(sendResponse.hash);
      retries++;
    }

    if (txResponse.status === "NOT_FOUND") {
      throw new Error("Transaction timed out waiting for confirmation");
    }

    if (txResponse.status === "FAILED") {
      throw new Error("Transaction failed on-chain");
    }

    return { success: true, hash: sendResponse.hash };
  } catch (error: any) {
    return { success: false, error: error.message || "Transaction failed" };
  }
}

/**
 * Simulate a read-only Soroban contract call and return the decoded result.
 *
 * No Freighter signature is required — the transaction is only simulated,
 * never submitted.  `sourceAddress` must be a funded account (the connected
 * wallet address works).
 */
async function simulateReadOnly(
  sourceAddress: string,
  buildOp: (contract: Contract) => xdr.Operation
): Promise<any> {
  const rpcServer = getRpcServer();
  const horizonServer = getHorizonServer();
  const contract = new Contract(CONTRACT_ADDRESS);

  const account = await horizonServer.loadAccount(sourceAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(buildOp(contract))
    .setTimeout(300)
    .build();

  const simulateResponse = await rpcServer.simulateTransaction(tx);

  // SimulateTransactionResponse is a union; check for the error variant
  if ("error" in simulateResponse && simulateResponse.error) {
    throw new Error(`Simulation failed: ${simulateResponse.error}`);
  }

  // On success, the return value lives in result retval
  const successResp = simulateResponse as any;
  if (successResp.result?.retval) {
    return scValToNative(successResp.result.retval);
  }

  return null;
}

// ─── Contract Client ─────────────────────────────────────────────────────────

export class EscrowClient {
  /**
   * Create a new escrow on-chain.
   *
   * Calls `create_escrow(payer, contractor, total_amount, milestone_descriptions)`
   * on the deployed Soroban contract.  The transaction is signed by the payer.
   *
   * @returns `ContractResult` with `escrowId` set to the on-chain ID on success.
   */
  async createEscrow(
    payerAddress: string,
    contractorAddress: string,
    totalAmount: number,
    milestoneDescriptions: { description: string; amount: number }[]
  ): Promise<ContractResult> {
    try {
      // Encode milestone_descriptions as Vec<(String, u64)>
      // In Soroban XDR, tuples are encoded as nested vectors.
      const milestoneVec = xdr.ScVal.scvVec(
        milestoneDescriptions.map((ms) =>
          xdr.ScVal.scvVec([
            stringToScVal(ms.description),
            u64ToScVal(ms.amount),
          ])
        )
      );

      const result = await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call(
          "create_escrow",
          addressToScVal(payerAddress),
          addressToScVal(contractorAddress),
          u64ToScVal(totalAmount),
          milestoneVec
        )
      );

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fund an escrow (deposit tokens into the escrow contract).
   *
   * Calls `fund_escrow(escrow_id)` on-chain.  Signed by the payer.
   */
  async fundEscrow(
    escrowId: string,
    payerAddress: string,
    _amount: number
  ): Promise<ContractResult> {
    try {
      return await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call("fund_escrow", stringToScVal(escrowId))
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve a milestone (payer confirms work completion).
   *
   * Calls `approve_milestone(escrow_id, milestone_id)` on-chain.
   * Signed by the payer.
   */
  async approveMilestone(
    escrowId: string,
    milestoneId: number,
    payerAddress: string
  ): Promise<ContractResult> {
    try {
      return await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call(
          "approve_milestone",
          stringToScVal(escrowId),
          u32ToScVal(milestoneId)
        )
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Release funds for an approved milestone.
   *
   * Calls `release_milestone(escrow_id, milestone_id)` on-chain.
   * Signed by the payer.
   */
  async releaseMilestone(
    escrowId: string,
    milestoneId: number,
    payerAddress: string
  ): Promise<ContractResult> {
    try {
      return await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call(
          "release_milestone",
          stringToScVal(escrowId),
          u32ToScVal(milestoneId)
        )
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Open a dispute on a milestone.
   *
   * Calls `open_dispute(escrow_id, milestone_id)` on-chain.
   * Signed by the caller (either payer or contractor).
   */
  async openDispute(
    escrowId: string,
    milestoneId: number,
    callerAddress: string
  ): Promise<ContractResult> {
    try {
      return await buildSignAndSubmit(callerAddress, (contract) =>
        contract.call(
          "open_dispute",
          stringToScVal(escrowId),
          u32ToScVal(milestoneId)
        )
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Refund remaining funds to the payer.
   *
   * Calls `refund_escrow(escrow_id)` on-chain.  Signed by the payer.
   */
  async refundEscrow(
    escrowId: string,
    payerAddress: string
  ): Promise<ContractResult> {
    try {
      return await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call("refund_escrow", stringToScVal(escrowId))
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get escrow details by ID (read-only simulation).
   *
   * Calls `get_escrow(escrow_id)` via simulation — no Freighter signature
   * needed.  `sourceAddress` must be a funded account (typically the
   * connected wallet address).
   *
   * @returns Parsed `Escrow` or `null` on failure.
   */
  async getEscrow(
    escrowId: string,
    sourceAddress: string
  ): Promise<Escrow | null> {
    try {
      const result = await simulateReadOnly(sourceAddress, (contract) =>
        contract.call("get_escrow", stringToScVal(escrowId))
      );

      if (!result || !Array.isArray(result)) {
        return null;
      }

      // Expected struct field order (must match the contract's return type):
      // [id, payer, contractor, total_amount, released_amount, status, created_at, milestones]
      const [
        id,
        payer,
        contractor,
        totalAmount,
        releasedAmount,
        statusIndex,
        createdAt,
        rawMilestones,
      ] = result;

      // Decode milestones vector — each milestone is itself a decoded array:
      // [id, description, amount, status, approved_by?, released_at?]
      const milestones: Milestone[] = Array.isArray(rawMilestones)
        ? rawMilestones.map((m: any) => ({
            id: Number(m[0] ?? 0),
            description: String(m[1] ?? ""),
            amount: Number(m[2] ?? 0),
            status: MILESTONE_STATUS_MAP[Number(m[3])] ?? "pending",
            approvedBy: m[4] != null ? String(m[4]) : undefined,
            releasedAt: m[5] != null ? Number(m[5]) : undefined,
          }))
        : [];

      return {
        id: String(id ?? escrowId),
        payer: String(payer ?? ""),
        contractor: String(contractor ?? ""),
        totalAmount: Number(totalAmount ?? 0),
        releasedAmount: Number(releasedAmount ?? 0),
        remainingAmount:
          Number(totalAmount ?? 0) - Number(releasedAmount ?? 0),
        status: ESCROW_STATUS_MAP[Number(statusIndex)] ?? "created",
        createdAt: Number(createdAt ?? 0),
        milestones,
      };
    } catch (error) {
      console.error("Failed to fetch escrow:", error);
      return null;
    }
  }

  /**
   * Get all escrows for a given address (read-only simulation).
   *
   * Fetches the on-chain escrow count via `get_escrow_count()`, then
   * iterates through each escrow, calling `get_escrow(i)` and filtering
   * by payer or contractor address.
   *
   * NOTE: This is O(N) simulations.  For production with many escrows,
   * consider adding a contract-side index function or caching results.
   *
   * @param address - Stellar address to filter by
   * @param sourceAddress - Funded address for simulation (typically the same as `address`)
   */
  async getEscrowsForAddress(
    address: string,
    sourceAddress?: string
  ): Promise<Escrow[]> {
    const source = sourceAddress ?? address;

    try {
      // Fetch total number of escrows on-chain
      const count = await simulateReadOnly(source, (contract) =>
        contract.call("get_escrow_count")
      );

      const escrowCount = Number(count);
      if (isNaN(escrowCount) || escrowCount <= 0) {
        return [];
      }

      // Fetch each escrow and keep only those involving the target address
      const escrows: Escrow[] = [];
      for (let i = 0; i < escrowCount; i++) {
        try {
          const escrow = await this.getEscrow(String(i), source);
          if (
            escrow &&
            (escrow.payer === address || escrow.contractor === address)
          ) {
            escrows.push(escrow);
          }
        } catch {
          // Individual fetch failure — skip and continue
        }
      }

      return escrows;
    } catch (error) {
      console.error("Failed to fetch escrows for address:", error);
      return [];
    }
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

/** Shared EscrowClient instance used across the application */
export const escrowClient = new EscrowClient();
