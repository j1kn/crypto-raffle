'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState } from 'react';

// Get WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fafc875947064cbb05b25b9b9407cad';

// Initialize Web3Modal with all wallets enabled
// Ensure explorer is enabled to show all wallets from WalletConnect Explorer
createWeb3Modal({
  projectId,
  wagmiConfig,
  enableAnalytics: true,
  // Explorer is enabled by default in defaultWagmiConfig
  // Don't set featuredWalletIds or excludeWalletIds - shows ALL wallets
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
