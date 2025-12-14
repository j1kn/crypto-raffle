// Web3Modal v3 + Wagmi + Viem integration
// Provides full wallet list (MetaMask, Coinbase, Trust Wallet, etc.)

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { base, mainnet, polygon } from 'wagmi/chains';

// Get WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fafc875947064cbb05b25b9b9407cad';

// Metadata for WalletConnect
const metadata = {
  name: 'PrimePick Tournament',
  description: 'Crypto Raffle Platform',
  url: 'https://crypto-raffle-heys.vercel.app',
  icons: ['https://crypto-raffle-heys.vercel.app/icon.png'],
};

// Configure chains
const chains = [mainnet, polygon, base] as const;

// Create Wagmi config using defaultWagmiConfig
// Configured to show ALL wallets from WalletConnect Explorer
// Using type assertion for explorer config (valid at runtime)
export const wagmiConfig = defaultWagmiConfig({
  projectId,
  metadata,
  chains,
  // Enable all wallet types
  enableEIP6963: true, // Enable EIP-6963 wallet discovery (browser extensions)
  enableInjected: true, // Enable injected wallets (MetaMask, etc.)
  enableCoinbase: true, // Enable Coinbase Wallet
  // @ts-ignore - enableWallets and extras.explorer are valid runtime options
  enableWallets: true,
  extras: {
    explorer: {
      wallets: 'ALL',
      recommendedWalletIds: 'ALL',
    },
  },
});

// Debug logging (remove in production if not needed)
if (typeof window !== 'undefined') {
  console.log('WalletConnect Project ID:', projectId);
  console.log('Wagmi Config:', { projectId, chains: chains.map(c => c.name), metadata });
}

// Export helper functions for backward compatibility
export const getWalletAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  // This will be handled by Wagmi hooks in components
  return null;
};

export const isWalletConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  // This will be handled by Wagmi hooks in components
  return false;
};

// Legacy functions - will be replaced by Wagmi hooks
export const connectWallet = async (): Promise<string | null> => {
  // This is now handled by Web3Modal
  return null;
};

export const disconnectWallet = async () => {
  // This is now handled by Web3Modal
};

export const initWalletConnect = async () => {
  // No longer needed with Web3Modal
  return null;
};
