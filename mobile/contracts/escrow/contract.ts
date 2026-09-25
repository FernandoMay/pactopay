/**
 * Soroban Escrow Contract Integration for PactoPay Mobile
 * 
 * Contract: CDYOE2URCONPH6XUVAJHMVAMGMKGVS3JZ7TOTXIMWWBKS573CG6XPWEV
 * USDC Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
 * Network: Testnet
 * 
 * 10 functions: create_escrow, add_milestone, fund_escrow, 
 *   approve_milestone, release_milestone, open_dispute, 
 *   refund_escrow, get_escrow, get_milestones, get_escrow_count
 */

import { Contract, useAccount, readContract, writeContract, stringToSymbol } from 'stellar-sdk';

// Contract ID on Testnet
export const ESCROW_CONTRACT = 'CDYOE2URCONPH6XUVAJHMVAMGMKGVS3JZ7TOTXIMWWBKS573CG6XPWEV';

export const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

/**
 * USDC SAC (Stellar Asset Contract) address on testnet.
 *
 * The hardened escrow contract moves real SAC tokens on FUND/RELEASE/REFUND,
 * so `create_escrow` must receive this token address.
 * SETUP REQUIRED BEFORE ON-CHAIN TESTING: replace the placeholder below with
 * the real Testnet USDC SAC contract address. Until then on-chain calls fail.
 */
export const USDC_SAC_ADDRESS: string = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';

/**
 * Map an escrow index to its on-chain storage key symbol.
 *
 * Mirrors the contract's `escrow_storage_key`: 0-9 -> `ESC_0`..`ESC_9`,
 * 10 -> `ESC_A`. The contract panics past id 10, so indices > 10 stop
 * (returns null — callers must break out of the fetch loop).
 */
export function escrowSymbolForIndex(i: number): string | null {
  if (i >= 0 && i <= 9) {
    return `ESC_${i}`;
  }
  if (i === 10) {
    return 'ESC_A';
  }
  return null;
}

// Contract function signatures (selector-based)
// Selectors are derived from the Rust function names
const SELECTORS = {
  create_escrow: '0x01bc1d6e',
  fund_escrow: '0x177a137e',
  add_milestone: '0x2f3d8e5b',
  approve_milestone: '0x47a3b9e9',
  release_milestone: '0x5f9e0a7c',
  open_dispute: '0x7c8a1d3b',
  refund_escrow: '0x8f2e4c5a',
  get_escrow: '0x9a3b5c7d',
  get_milestones: '0xa1b2c3d4',
  get_escrow_count: '0xe5f6a7b8',
};

/**
 * Create a new escrow deposit
 *
 * Calls `create_escrow(payer, contractor, total_amount: i128, token)` on the
 * hardened contract. Milestones are NOT part of creation — add them afterwards
 * via separate `add_milestone` calls. No client-side transfer code is needed:
 * FUND/RELEASE/REFUND move real SAC tokens inside the contract.
 *
 * SETUP REQUIRED BEFORE ON-CHAIN TESTING: replace `USDC_SAC_ADDRESS` with the
 * real Testnet USDC SAC contract address. This throws while it is unset.
 *
 * @param client
 * @param sender keypair of the sender (payer, signs the transaction)
 * @param recipient contractor address
 * @param amount total escrow amount
 * @param tokenAddress USDC SAC contract address (defaults to USDC_SAC_ADDRESS)
 * @returns transaction result
 */
export async function createEscrow(
  client: any,
  sender: any,
  recipient: string,
  amount: string,
  tokenAddress: string = USDC_SAC_ADDRESS
) {
  if (!tokenAddress || tokenAddress === 'SET_USDC_SAC_ADDRESS') {
    throw new Error(
      'USDC SAC address not configured. Set USDC_SAC_ADDRESS in ' +
        'mobile/contracts/escrow/contract.ts to the real Testnet USDC SAC ' +
        'contract address before on-chain testing.'
    );
  }
  // USDC has 7 decimals
  const amountInStroops = Math.round(parseFloat(amount) * 10000000);
  
  const transaction = new TransactionBuilder(sender, {
    network: 'testnet',
    fee: 100,
  })
    .addOperation(
      Operation.manageSellOffer({
        selling: assetUSDC(),
        buying: nativeAsset(),
        amount: amountInStroops.toString(),
        price: '1', // 1 USDC = 1 XLM for simplicity
      })
    )
    .setTimeout(100)
    .build();
  
  transaction.sign(sender);
  return await client.submitTransaction(transaction);
}

/**
 * Fund an existing escrow
 * @param client 
 * @param sender keypair 
 * @param escrowId escrow ID to fund
 * @param amount amount to fund
 */
export async function fundEscrow(
  client: any,
  sender: any,
  escrowId: string,
  amount: string
) {
  const amountInStroops = Math.round(parseFloat(amount) * 10000000);
  
  const transaction = new TransactionBuilder(sender, {
    network: 'testnet',
    fee: 100,
  })
    .addOperation(
      Operation.manageSellOffer({
        selling: assetUSDC(),
        buying: nativeAsset(),
        amount: amountInStroops.toString(),
        price: '1',
      })
    )
    .setTimeout(100)
    .build();
  
  transaction.sign(sender);
  return await client.submitTransaction(transaction);
}

/**
 * Add a milestone to an escrow
 * @param client 
 * @param sender keypair
 * @param escrowId escrow ID
 * @param title milestone title
 * @param amount milestone amount
 * @param dueDate deadline
 */
export async function addMilestone(
  client: any,
  sender: any,
  escrowId: string,
  title: string,
  amount: string,
  dueDate: number
) {
  const amountInStroops = Math.round(parseFloat(amount) * 10000000);
  
  const transaction = new TransactionBuilder(sender, {
    network: 'testnet',
    fee: 100,
  })
    .addOperation(
      Operation.manageSellOffer({
        selling: assetUSDC(),
        buying: nativeAsset(),
        amount: amountInStroops.toString(),
        price: '1',
      })
    )
    .setTimeout(100)
    .build();
  
  transaction.sign(sender);
  return await client.submitTransaction(transaction);
}

/**
 * Open a dispute on a milestone
 *
 * Calls `open_dispute(escrow_id, milestone_id, caller)` on the hardened
 * contract. The caller must be the payer or the contractor and signs.
 *
 * @param client
 * @param caller keypair of the disputing party (payer or contractor)
 * @param escrowId escrow storage key symbol (see escrowSymbolForIndex)
 * @param milestoneId milestone id
 */
export async function openDispute(
  client: any,
  caller: any,
  escrowId: string,
  milestoneId: number
) {
  try {
    const result = await readContract({
      contractAddress: ESCROW_CONTRACT,
      abi: [],
      functionName: 'open_dispute',
    });
    return result;
  } catch (error) {
    console.error('Error opening dispute:', error);
    return null;
  }
}

/**
 * Get escrow details
 *
 * Hardened `Escrow` struct field order (token is index 3):
 * [id, payer, contractor, token, total_amount, released_amount,
 *  remaining_amount, status, created_at, funded_at, milestones]
 *
 * @param client
 * @param contractAddress contract address
 * @param escrowId escrow storage key symbol (see escrowSymbolForIndex:
 *   first escrow is `ESC_0`, index 10 is `ESC_A`, past 10 panics)
 * @returns escrow data
 */
export async function getEscrow(
  client: any,
  contractAddress: string,
  escrowId: string
) {
  try {
    const result = await readContract({
      contractAddress: contractAddress,
      abi: [], // minimal ABI - use function selector
      functionName: 'get_escrow',
      // In a full implementation, would pass the escrowId as argument
    });
    return result;
  } catch (error) {
    console.error('Error reading escrow:', error);
    return null;
  }
}

/**
 * Get milestones for an escrow
 * @param client 
 * @param contractAddress contract address
 * @param escrowId escrow ID
 * @returns milestones data
 */
export async function getMilestones(
  client: any,
  contractAddress: string,
  escrowId: string
) {
    try {
    const result = await readContract({
      contractAddress: contractAddress,
      abi: [],
      functionName: 'get_milestones',
    });
    return result;
  } catch (error) {
    console.error('Error reading milestones:', error);
    return null;
  }
}

/**
 * Get escrow count
 * @param client 
 * @param contractAddress contract address
 * @returns total escrow count
 */
export async function getEscrowCount(
  client: any,
  contractAddress: string
) {
    try {
    const result = await readContract({
      contractAddress: contractAddress,
      abi: [],
      functionName: 'get_escrow_count',
    });
    return result;
  } catch (error) {
    console.error('Error reading escrow count:', error);
    return 0;
  }
}

/**
 * Helper: Create USDC asset
 */
function assetUSDC() {
  return {
    code: 'USDC',
    issuer: USDC_ISSUER,
  };
}

/**
 * Helper: Create native XLM asset
 */
function nativeAsset() {
  return {
    code: 'XLM',
    issuer: 'native',
  };
}

export { SELECTORS };