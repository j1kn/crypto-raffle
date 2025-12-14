'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState } from 'react';

// Get WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fafc875947064cbb05b25b9b9407cad';

// Initialize Web3Modal with all wallets enabled
// Web3Modal v5 shows all wallets from WalletConnect Explorer by default
// The explorer is automatically enabled and displays all available wallets
createWeb3Modal({
  projectId,
  wagmiConfig,
  enableAnalytics: true,
  // Explorer is enabled by default - shows all wallets from WalletConnect Explorer
  // Don't set featuredWalletIds or excludeWalletIds to show ALL wallets
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00ff88', // Primary green
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
