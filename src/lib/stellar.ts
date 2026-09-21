import * as StellarSdk from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

/**
 * Check if Freighter is installed
 */
export function isFreighterAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).freighter;
}

/**
 * Get Freighter instance
 */
function getFreighter() {
  if (!isFreighterAvailable()) {
    throw new Error("Freighter no está instalado. Instálalo desde freighter.app");
  }
  return (window as any).freighter;
}

/**
 * Connect to Freighter and get the public key
 */
export async function connectFreighter(): Promise<{
  address: string;
  network: "testnet" | "mainnet";
}> {
  const freighter = getFreighter();

  const [address, network] = await Promise.all([
    freighter.getPublicKey(),
    freighter.getNetwork(),
  ]);

  return {
    address,
    network: network === "TESTNET" ? "testnet" : "mainnet",
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
        b.asset_issuer === "GA5ZSEJYB37JDD5G4LYX3M6T6N3V42GFIMXTO24ELCKZ54U3BKHUFCUG"
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
  assetIssuer = "GA5ZSEJYB37JDD5G4LYX3M6T6N3V42GFIMXTO24ELCKZ54U3BKHUFCUG"
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
    const freighter = getFreighter();
    const signedTx = await freighter.signTransaction(transaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const result = await server
      .submitTransaction(StellarSdk.TransactionBuilder.fromXDR(signedTx, NETWORK_PASSPHRASE));

    return { success: true, hash: result.hash };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al firmar transacción" };
  }
}
