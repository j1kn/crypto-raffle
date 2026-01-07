/**
 * Utility functions for generating Etherscan/block explorer links
 */

export interface ChainConfig {
  chainId: number;
  explorerUrl: string;
  name: string;
}

// Common blockchain explorers
const EXPLORERS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    name: 'Ethereum',
  },
  137: {
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    name: 'Polygon',
  },
  56: {
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    name: 'BSC',
  },
  43114: {
    chainId: 43114,
    explorerUrl: 'https://snowtrace.io',
    name: 'Avalanche',
  },
  42161: {
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    name: 'Arbitrum',
  },
  10: {
    chainId: 10,
    explorerUrl: 'https://optimistic.etherscan.io',
    name: 'Optimism',
  },
  250: {
    chainId: 250,
    explorerUrl: 'https://ftmscan.com',
    name: 'Fantom',
  },
  8453: {
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    name: 'Base',
  },
};

/**
 * Get Etherscan/block explorer URL for a transaction hash
 * @param txHash - Transaction hash (with or without 0x prefix)
 * @param chainId - Chain ID (defaults to 1 for Ethereum Mainnet)
 * @returns Full URL to view transaction on block explorer
 */
export function getEtherscanTxUrl(txHash: string, chainId: number = 1): string {
  // Ensure txHash has 0x prefix
  const normalizedHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  
  const explorer = EXPLORERS[chainId] || EXPLORERS[1]; // Default to Ethereum if chain not found
  return `${explorer.explorerUrl}/tx/${normalizedHash}`;
}

/**
 * Get Etherscan/block explorer URL for an address
 * @param address - Wallet address (with or without 0x prefix)
 * @param chainId - Chain ID (defaults to 1 for Ethereum Mainnet)
 * @returns Full URL to view address on block explorer
 */
export function getEtherscanAddressUrl(address: string, chainId: number = 1): string {
  // Ensure address has 0x prefix
  const normalizedAddress = address.startsWith('0x') ? address : `0x${address}`;
  
  const explorer = EXPLORERS[chainId] || EXPLORERS[1]; // Default to Ethereum if chain not found
  return `${explorer.explorerUrl}/address/${normalizedAddress}`;
}

/**
 * Format transaction hash for display (first 10 chars + ... + last 8 chars)
 * @param txHash - Transaction hash
 * @returns Formatted hash string
 */
export function formatTxHash(txHash: string): string {
  if (!txHash) return '';
  const normalized = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  if (normalized.length <= 18) return normalized;
  return `${normalized.slice(0, 10)}...${normalized.slice(-8)}`;
}

