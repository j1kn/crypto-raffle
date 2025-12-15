'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState } from 'react';

// Get WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'f3d84f94db7d9e42a9faeff19847f751';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Web3Modal Project ID:', projectId);
  console.log('Web3Modal Config:', { projectId, enableAnalytics: true, enableWallets: true });
}

// Initialize Web3Modal with all wallets enabled
// Configured to show ALL wallets from WalletConnect Explorer
createWeb3Modal({
  projectId,
  wagmiConfig,
  enableAnalytics: true,
  allWallets: 'SHOW', // Show all wallets
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00ff88', // Primary green
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
