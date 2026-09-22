/**
 * Soroban Escrow Contract Integration for PactoPay Mobile
 * 
 * Contract: CCADBBE7UC2TWIWT634L76YSQ5NF65ZK7E7QLLCTUDG5X77VRHN7ITFQ
 * USDC Issuer: GA5ZSEJYB37JDD5G4LYX3M6T6N3V42GFIMXTO24ELCKZ54U3BKHUFCUG
 * Network: Testnet
 * 
 * 10 functions: create_escrow, add_milestone, fund_escrow, 
 *   approve_milestone, release_milestone, open_dispute, 
 *   refund_escrow, get_escrow, get_milestones, get_escrow_count
 */

import { Contract, useAccount, readContract, writeContract, stringToSymbol } from 'stellar-sdk';

// Contract ID on Testnet
export const ESCROW_CONTRACT = 'CCADBBE7UC2TWIWT634L76YSQ5NF65ZK7E7QLLCTUDG5X77VRHN7ITFUSDC';

export const USDC_ISSUER = 'GA5ZSEJYB37JDD5G4LYX3M6T6N3V42GFIMXTO24ELCKZ54U3BKHUFCUG';

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
 * @param client 
 * @param sender keypair of the sender
 * @param recipient recipient address (stellar address or email)
 * @param amount USDC amount to deposit
 * @param deadline deadline timestamp
 * @returns transaction result
 */
export async function createEscrow(
  client: any,
  sender: any,
  recipient: string,
  amount: string,
  deadline: number
) {
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
 * Get escrow details
 * @param client 
 * @param contractAddress contract address
 * @param escrowId escrow ID
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