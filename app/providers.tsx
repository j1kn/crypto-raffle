'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState, useEffect } from 'react';

// Initialize Web3Modal
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fafc875947064cbb05b25b9b9407cad';

createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
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

