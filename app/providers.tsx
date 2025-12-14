'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState } from 'react';

// Get WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fafc875947064cbb05b25b9b9407cad';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Web3Modal Project ID:', projectId);
  console.log('Web3Modal Config:', { projectId, enableAnalytics: true, enableWallets: true });
}

// Initialize Web3Modal with all wallets enabled
// Configured to show ALL wallets from WalletConnect Explorer
// Using type assertion to include explorer config (valid at runtime even if not in types)
createWeb3Modal({
  projectId,
  wagmiConfig,
  enableAnalytics: true,
  allWallets: 'SHOW',
  // @ts-ignore - explorer config is valid at runtime for showing all wallets
  explorer: {
    wallets: 'ALL',
    recommendedWalletIds: 'ALL',
  },
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
