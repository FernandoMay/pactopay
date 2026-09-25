/**
 * PactoPay Escrow Contract Client
 *
 * Real Soroban smart contract integration using @stellar/stellar-sdk.
 * All transactions are built, simulated, signed via Freighter, and submitted on-chain.
 *
 * Deployed contract: CDYOE2URCONPH6XUVAJHMVAMGMKGVS3JZ7TOTXIMWWBKS573CG6XPWEV
 * Explorer: https://stellar.expert/explorer/testnet/contract/CDYOE2URCONPH6XUVAJHMVAMGMKGVS3JZ7TOTXIMWWBKS573CG6XPWEV
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
import { signTransaction as freighterSignTransaction } from "@stellar/freighter-api";

// ─── Configuration ───────────────────────────────────────────────────────────

/** Deployed Soroban escrow contract on Stellar testnet */
const CONTRACT_ADDRESS =
  "CDYOE2URCONPH6XUVAJHMVAMGMKGVS3JZ7TOTXIMWWBKS573CG6XPWEV";

/** Soroban RPC endpoint for contract simulations and submissions */
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

/** Horizon endpoint for account/transaction queries */
const HORIZON_URL = "https://horizon-testnet.stellar.org";

/** Network passphrase for Stellar testnet */
const NETWORK_PASSPHRASE = Networks.TESTNET;

/**
 * USDC SAC (Stellar Asset Contract) address on testnet.
 *
 * The hardened escrow contract moves real SAC tokens on FUND/RELEASE/REFUND,
 * so `create_escrow` must receive this token address. Set it via the
 * `VITE_USDC_SAC_ADDRESS` environment variable before on-chain testing.
 * Until the real Testnet USDC SAC address is set, on-chain calls will fail.
 */
export const USDC_SAC_ADDRESS: string =
  ((import.meta as any).env?.VITE_USDC_SAC_ADDRESS as string | undefined) ??
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

/**
 * Map an escrow index to its on-chain storage key symbol.
 *
 * Mirrors the contract's `escrow_storage_key`: 0-9 -> `ESC_0`..`ESC_9`,
 * 10 -> `ESC_A`. The contract panics past id 10, so indices > 10 stop.
 */
export function escrowSymbolForIndex(i: number): string | null {
  if (i >= 0 && i <= 9) {
    return `ESC_${i}`;
  }
  if (i === 10) {
    return "ESC_A";
  }
  return null;
}

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
  token: string;
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

/**
 * Sync best-effort check for Freighter: true once the extension content
 * script has injected its `freighterApi` bridge. Signing itself always goes
 * through the official `@stellar/freighter-api` package.
 */
function isFreighterAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).freighterApi;
}

/** Throw a clear Spanish error when Freighter is not installed */
function requireFreighter(): void {
  if (!isFreighterAvailable()) {
    throw new Error(
      "Billetera Freighter no detectada. Instalá la extensión desde freighter.app"
    );
  }
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

/** Convert an escrow ID (e.g. "ESC_0") to an ScVal symbol (contract takes Symbol) */
function symbolToScVal(value: string): xdr.ScVal {
  return xdr.ScVal.scvSymbol(value);
}

/** Convert a JS number to an ScVal u32 */
function u32ToScVal(value: number): xdr.ScVal {
  return xdr.ScVal.scvU32(value);
}

/** Convert a JS number/bigint to an ScVal u64 */
function u64ToScVal(value: number | bigint): xdr.ScVal {
  return xdr.ScVal.scvU64(xdr.Uint64.fromString(String(Math.floor(Number(value)))));
}

/** Convert a JS number/bigint to an ScVal i128 (contract total_amount type) */
function i128ToScVal(value: number | bigint): xdr.ScVal {
  const big = BigInt(Math.floor(Number(value)));
  const lo = big & 0xffffffffffffffffn;
  const hi = big >> 64n; // arithmetic shift keeps the sign for negatives
  return xdr.ScVal.scvI128(
    new xdr.Int128Parts({
      hi: xdr.Int64.fromString(hi.toString()),
      lo: xdr.Uint64.fromString(lo.toString()),
    })
  );
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
    requireFreighter();

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

    // Sign the prepared transaction with Freighter. The official API
    // returns { signedTxXdr, signerAddress }, not a raw XDR string.
    const signed = await freighterSignTransaction(preparedTx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (signed.error || !signed.signedTxXdr) {
      throw new Error(
        (typeof signed.error === "string" && signed.error) ||
          "No se pudo firmar la transacción en Freighter. Desbloqueá la extensión e intentá de nuevo."
      );
    }

    const signedXdr = signed.signedTxXdr;

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
   * Calls `create_escrow(payer, contractor, total_amount: i128, token)` on the
   * hardened Soroban contract. Milestones are NOT part of creation — add them
   * afterwards via separate `add_milestone` calls. The transaction is signed
   * by the payer. No client-side transfer code is needed: FUND/RELEASE/REFUND
   * move real SAC tokens inside the contract.
   *
   * SETUP REQUIRED BEFORE ON-CHAIN TESTING: set the `VITE_USDC_SAC_ADDRESS`
   * env var (consumed as `USDC_SAC_ADDRESS`) to the real Testnet USDC SAC
   * contract address. Until then this call throws and nothing is submitted.
   *
   * @returns `ContractResult` with `escrowId` set to the on-chain ID on success.
   */
  async createEscrow(
    payerAddress: string,
    contractorAddress: string,
    totalAmount: number,
    tokenAddress: string = USDC_SAC_ADDRESS
  ): Promise<ContractResult> {
    if (!tokenAddress || tokenAddress === "SET_USDC_SAC_ADDRESS") {
      throw new Error(
        "USDC SAC address not configured. Set the VITE_USDC_SAC_ADDRESS " +
          "environment variable (exported as USDC_SAC_ADDRESS) to the real " +
          "Testnet USDC SAC contract address before on-chain testing."
      );
    }
    try {
      const result = await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call(
          "create_escrow",
          addressToScVal(payerAddress),
          addressToScVal(contractorAddress),
          i128ToScVal(totalAmount),
          addressToScVal(tokenAddress)
        )
      );

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a milestone to a created escrow.
   *
   * Calls `add_milestone(escrow_id, description, amount)` on-chain.
   * Signed by the payer. The sum of all milestone amounts must not
   * exceed the escrow total. Call once per milestone after
   * `createEscrow` and before funding.
   */
  async addMilestone(
    escrowId: string,
    description: string,
    amount: number,
    payerAddress: string
  ): Promise<ContractResult> {
    try {
      return await buildSignAndSubmit(payerAddress, (contract) =>
        contract.call(
          "add_milestone",
          symbolToScVal(escrowId),
          symbolToScVal(description),
          i128ToScVal(amount)
        )
      );
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
        contract.call("fund_escrow", symbolToScVal(escrowId))
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
          symbolToScVal(escrowId),
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
          symbolToScVal(escrowId),
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
   * Calls `open_dispute(escrow_id, milestone_id, caller)` on-chain.
   * The caller must be the payer or the contractor and signs the transaction.
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
          symbolToScVal(escrowId),
          u32ToScVal(milestoneId),
          addressToScVal(callerAddress)
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
        contract.call("refund_escrow", symbolToScVal(escrowId))
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
        contract.call("get_escrow", symbolToScVal(escrowId))
      );

      if (!result || !Array.isArray(result)) {
        return null;
      }

      // Expected struct field order (must match the contract's Escrow struct):
      // [id, payer, contractor, token, total_amount, released_amount,
      //  remaining_amount, status, created_at, funded_at, milestones]
      const [
        id,
        payer,
        contractor,
        token,
        totalAmount,
        releasedAmount,
        remainingAmount,
        statusIndex,
        createdAt,
        fundedAt,
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
        token: String(token ?? ""),
        totalAmount: Number(totalAmount ?? 0),
        releasedAmount: Number(releasedAmount ?? 0),
        remainingAmount: Number(remainingAmount ?? 0),
        status: ESCROW_STATUS_MAP[Number(statusIndex)] ?? "created",
        createdAt: Number(createdAt ?? 0),
        fundedAt: fundedAt != null ? Number(fundedAt) : undefined,
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
   * iterates indices 0..count-1, mapping each to its storage key symbol
   * (`ESC_0`..`ESC_9`, `ESC_A`) and filtering by payer or contractor.
   * Iteration stops past index 10 — the contract panics beyond that.
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
        const symbol = escrowSymbolForIndex(i);
        if (symbol === null) {
          // Contract panics past index 10 — stop iterating.
          break;
        }
        try {
          const escrow = await this.getEscrow(symbol, source);
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
