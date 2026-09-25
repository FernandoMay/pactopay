import * as StellarSdk from "@stellar/stellar-sdk";
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getNetworkDetails,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

/**
 * Sync best-effort check for first paint: true once the Freighter
 * extension content script has injected its `freighterApi` bridge.
 * Use `isFreighterInstalled()` for the authoritative async check.
 */
export function isFreighterAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).freighterApi;
}

/**
 * Authoritative availability check via the official Freighter API.
 * Resolves true when the extension is installed and reachable.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await freighterIsConnected();
    return res.isConnected === true;
  } catch {
    return false;
  }
}

/** Extract a readable message from a Freighter API error. */
function freighterErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message ?? "");
  }
  return "";
}

/**
 * Connect to Freighter and get the public key.
 * Prompts the user for account access on first use; resolves
 * immediately when the app was already authorized.
 */
export async function connectFreighter(): Promise<{
  address: string;
  network: "testnet" | "mainnet";
}> {
  const access = await requestAccess();

  if (access.error || !access.address) {
    throw new Error(
      freighterErrorMessage(access.error) ||
        "No se pudo obtener tu dirección de Freighter. Aprobá el acceso en la extensión e intentá de nuevo."
    );
  }

  let network: "testnet" | "mainnet" = "testnet";
  try {
    const details = await getNetworkDetails();
    if (!details.error) {
      if (details.networkPassphrase) {
        network =
          details.networkPassphrase === StellarSdk.Networks.PUBLIC
            ? "mainnet"
            : "testnet";
      } else if (details.network) {
        network = details.network.toUpperCase() === "PUBLIC" ? "mainnet" : "testnet";
      }
    }
  } catch {
    // Keep the testnet default when network details are unavailable.
  }

  return {
    address: access.address,
    network,
  };
}

/**
 * Get the USDC balance for an account
 */
export async function getUsdcBalance(publicKey: string): Promise<number> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    const usdcBalance = account.balances.find(
      (b: any) =>
        b.asset_type !== "native" &&
        b.asset_code === "USDC" &&
        b.asset_issuer === "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    );
    return usdcBalance ? parseFloat(usdcBalance.balance) : 0;
  } catch {
    return 0;
  }
}

/**
 * Get the XLM balance for an account
 */
export async function getXlmBalance(publicKey: string): Promise<number> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
  } catch {
    return 0;
  }
}

/**
 * Build and simulate a payment transaction (for demo purposes)
 */
export async function buildPaymentTransaction(
  fromAddress: string,
  toAddress: string,
  amount: string,
  assetCode = "USDC",
  assetIssuer = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
): Promise<StellarSdk.Transaction> {
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(fromAddress);

  const asset = new StellarSdk.Asset(assetCode, assetIssuer);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toAddress,
        asset,
        amount,
      })
    )
    .setTimeout(180)
    .build();

  return transaction;
}

/**
 * Sign and submit a transaction via Freighter
 */
export async function signAndSubmit(
  transaction: StellarSdk.Transaction
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const signed = await freighterSignTransaction(transaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (signed.error || !signed.signedTxXdr) {
      return {
        success: false,
        error:
          freighterErrorMessage(signed.error) || "Error al firmar transacción",
      };
    }

    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const result = await server
      .submitTransaction(StellarSdk.TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE));

    return { success: true, hash: result.hash };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al firmar transacción" };
  }
}
