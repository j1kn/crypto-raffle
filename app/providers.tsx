'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig } from '@/lib/wallet';
import { useState, useEffect } from 'react';

// Get WalletConnect Project ID
// IMPORTANT: This must be available at build time for Next.js
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'f3d84f94db7d9e42a9faeff19847f751';

// Verify project ID is valid (32 characters)
if (projectId.length !== 32) {
  console.warn('[Web3Modal] Warning: Project ID length is not 32. Expected format: 32-character hex string');
}

// Initialize Web3Modal - must be called before any useWeb3Modal hooks
// This runs on module load, but only executes the actual initialization on client side
try {
  // Initialize Web3Modal with all wallets enabled
  // Configured to show ALL wallets from WalletConnect Explorer
  createWeb3Modal({
    projectId,
    wagmiConfig,
    enableAnalytics: true,
    // Show all wallets from WalletConnect Explorer - this is the key setting
    allWallets: 'SHOW',
    // Enable wallet features
    enableOnramp: true,
    enableSwaps: true,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#00ff88', // Primary green
      '--w3m-background-color': '#0a0a0a',
      '--w3m-container-border-radius': '12px',
    },
    // Metadata for WalletConnect
    metadata: {
      name: 'PrimePick Tournament',
      description: 'Crypto Raffle Platform',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://crypto-raffle-heys.vercel.app',
      icons: ['https://crypto-raffle-heys.vercel.app/icon.png'],
    },
  });
  
  // Debug logging (client-side only)
  if (typeof window !== 'undefined') {
    console.log('[Web3Modal] ✅ Initialized successfully');
    console.log('[Web3Modal] Project ID:', projectId);
    console.log('[Web3Modal] Project ID length:', projectId.length, '(should be 32)');
    console.log('[Web3Modal] Env var available:', !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
    console.log('[Web3Modal] Configuration:', {
      allWallets: 'SHOW',
      enableAnalytics: true,
      themeMode: 'dark',
      currentURL: window.location.href,
    });
    
    // Test WalletConnect Explorer API connectivity
    setTimeout(() => {
      fetch(`https://explorer-api.walletconnect.com/v3/wallets?projectId=${projectId}&entries=10`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          const walletCount = data?.count || data?.length || 0;
          console.log('[Web3Modal] ✅ Explorer API Connected');
          console.log('[Web3Modal] Wallets available:', walletCount);
          if (walletCount > 0) {
            console.log('[Web3Modal] Sample wallets:', data?.slice?.(0, 3)?.map((w: any) => w.name || w.id) || 'N/A');
          } else {
            console.warn('[Web3Modal] ⚠️  No wallets returned - check Project ID and domain whitelisting');
          }
        })
        .catch(err => {
          console.error('[Web3Modal] ❌ Explorer API Error:', err.message);
          console.error('[Web3Modal] This might indicate:');
          console.error('  1. Domain not whitelisted in WalletConnect Cloud');
          console.error('  2. Project ID incorrect');
          console.error('  3. Network/CORS issue');
        });
    }, 1000);
  }
} catch (error) {
  // Silently fail during SSR - will be initialized on client
  if (typeof window !== 'undefined') {
    console.error('[Web3Modal] ❌ Error initializing:', error);
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
