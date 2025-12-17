'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState, useEffect } from 'react';

// Get WalletConnect Project ID
// IMPORTANT: This must be available at build time for Next.js
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'f3d84f94db7d9e42a9faeff19847f751';

// Initialize Web3Modal - must be called before any useWeb3Modal hooks
// This runs on module load, but only executes the actual initialization on client side
try {
  // Initialize Web3Modal with all wallets enabled
  // Configured to show ALL wallets from WalletConnect Explorer
  createWeb3Modal({
    projectId,
    wagmiConfig,
    enableAnalytics: true,
    // Show all wallets from WalletConnect Explorer
    allWallets: 'SHOW',
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#00ff88', // Primary green
    },
  });
  
  // Debug logging (client-side only)
  if (typeof window !== 'undefined') {
    console.log('[Web3Modal] Project ID:', projectId);
    console.log('[Web3Modal] Project ID length:', projectId.length);
    console.log('[Web3Modal] Expected length: 32');
    console.log('[Web3Modal] Env var available:', !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
    console.log('[Web3Modal] Initialized successfully with allWallets: SHOW');
    console.log('[Web3Modal] Current URL:', window.location.href);
    console.log('[Web3Modal] Wagmi Config:', { projectId, chains: wagmiConfig.chains?.map((c: any) => c.name) });
    
    // Check if WalletConnect Explorer API is accessible
    fetch('https://explorer-api.walletconnect.com/v3/wallets?projectId=' + projectId)
      .then(res => res.json())
      .then(data => {
        console.log('[Web3Modal] Explorer API Response:', {
          count: data?.count || data?.length || 0,
          hasWallets: !!(data?.count || data?.length),
          sample: data?.slice?.(0, 3) || 'N/A'
        });
      })
      .catch(err => {
        console.error('[Web3Modal] Explorer API Error:', err);
        console.error('[Web3Modal] This might indicate a CORS or network issue');
      });
  }
} catch (error) {
  // Silently fail during SSR - will be initialized on client
  if (typeof window !== 'undefined') {
    console.error('[Web3Modal] Error initializing:', error);
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
