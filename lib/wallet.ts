// WalletConnect v2 integration - Mobile-friendly and supports all wallets

import type { EthereumProvider } from '@walletconnect/ethereum-provider';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: any | null;
}

// Initialize wallet state from localStorage if available
const getInitialState = (): WalletState => {
  if (typeof window === 'undefined') {
    return { address: null, isConnected: false, provider: null };
  }
  
  try {
    const saved = localStorage.getItem('walletState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        address: parsed.address || null,
        isConnected: parsed.isConnected || false,
        provider: null, // Don't restore provider, will reconnect if needed
      };
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  return { address: null, isConnected: false, provider: null };
};

let walletState: WalletState = getInitialState();

// Save wallet state to localStorage
const saveWalletState = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('walletState', JSON.stringify({
        address: walletState.address,
        isConnected: walletState.isConnected,
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
};

// Client-side only - WalletConnect v2 needs NEXT_PUBLIC_ prefix
const getProjectId = (): string => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fafc875947064cbb05b25b9b9407cad';
};

export const initWalletConnect = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('WalletConnect can only be initialized on the client side');
  }

  // Check if already connected
  if (walletState.provider && walletState.provider.connected) {
    const accounts = walletState.provider.accounts;
    if (accounts && accounts.length > 0) {
      walletState.address = accounts[0];
      walletState.isConnected = true;
      return walletState.provider;
    }
  }

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('WalletConnect Project ID not found. Make sure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set.');
  }

  try {
    console.log('Initializing WalletConnect v2 with project ID:', projectId);
    
    // Dynamic import for WalletConnect v2
    const { EthereumProvider: EthereumProviderClass } = await import('@walletconnect/ethereum-provider');
    
    // WalletConnect v2 initialization - Mobile-friendly configuration
    // The modal will show both QR code and wallet list
    // By default, WalletConnect v2 modal shows:
    // 1. QR Code tab - for mobile wallets to scan
    // 2. Wallets/Explorer tab - shows all available wallets (MetaMask, Trust Wallet, Coinbase, etc.)
    // Users can click on the "Wallets" tab to see and select from the wallet list
    const provider = await EthereumProviderClass.init({
      projectId,
      // Support major EVM chains
      chains: [1, 137, 56, 43114, 42161, 10, 250], // Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, Fantom
      optionalChains: [8453, 59144, 534352], // Base, Linea, Scroll
      showQrModal: true, // This enables the modal with both QR code and wallet list tabs
      metadata: {
        name: 'PrimePick Tournament',
        description: 'Crypto Raffle Platform - Play to Earn',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    });
    
    // IMPORTANT: The WalletConnect v2 modal has TWO tabs:
    // - "QR Code" tab (default) - shows QR code for mobile wallet scanning
    // - "Wallets" or "Explorer" tab - shows a list of all available wallets
    // Users should click on the "Wallets" tab to see and select from the wallet list
    // The wallet list includes: MetaMask, Trust Wallet, Coinbase Wallet, Rainbow, etc.

    walletState.provider = provider;

    // Set up event listeners for WalletConnect v2
    provider.on('display_uri', (uri: string) => {
      console.log('WalletConnect URI:', uri);
      // Mobile wallets can use this URI for deep linking
    });

    provider.on('connect', () => {
      console.log('WalletConnect connected event fired');
      // Wait a bit for accounts to be populated
      setTimeout(() => {
        const accounts = provider.accounts;
        console.log('Accounts in connect event:', accounts);
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          walletState.address = accounts[0];
          walletState.isConnected = true;
          saveWalletState();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('walletStateChanged'));
          }
        }
      }, 500);
    });

    provider.on('disconnect', () => {
      console.log('WalletConnect disconnected');
      walletState.address = null;
      walletState.isConnected = false;
      walletState.provider = null;
      saveWalletState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
        localStorage.removeItem('walletState');
      }
    });

    provider.on('session_event', (payload: any) => {
      console.log('WalletConnect session event:', payload);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
      }
    });

    provider.on('session_delete', () => {
      console.log('WalletConnect session deleted');
      walletState.address = null;
      walletState.isConnected = false;
      walletState.provider = null;
      saveWalletState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
        localStorage.removeItem('walletState');
      }
    });

    // Handle accounts changed (EIP-1193)
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        walletState.address = accounts[0];
        walletState.isConnected = true;
        saveWalletState();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('walletStateChanged'));
        }
      } else {
        walletState.address = null;
        walletState.isConnected = false;
        saveWalletState();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('walletStateChanged'));
        }
      }
    });

    provider.on('chainChanged', () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
      }
    });

    return provider;
  } catch (error) {
    console.error('Failed to initialize WalletConnect:', error);
    throw error;
  }
};

export const connectWallet = async (): Promise<string | null> => {
  try {
    console.log('Initializing WalletConnect v2...');
    const provider = await initWalletConnect();
    
    if (!provider) {
      throw new Error('Failed to initialize wallet provider');
    }
    
    // Check if already connected
    if (provider.connected) {
      // Try to get accounts using request method
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          walletState.address = accounts[0];
          walletState.isConnected = true;
          saveWalletState();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('walletStateChanged'));
          }
          console.log('Wallet already connected:', accounts[0]);
          return accounts[0];
        }
      } catch (e) {
        console.log('Error getting accounts with request, trying provider.accounts');
      }
      
      // Fallback to provider.accounts
      if (provider.accounts && Array.isArray(provider.accounts) && provider.accounts.length > 0) {
        walletState.address = provider.accounts[0];
        walletState.isConnected = true;
        saveWalletState();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('walletStateChanged'));
        }
        console.log('Wallet already connected (from provider.accounts):', provider.accounts[0]);
        return provider.accounts[0];
      }
    }
    
    console.log('Requesting wallet connection...');
    
    // WalletConnect v2: enable() opens the connection modal
    await provider.enable();
    
    console.log('Enable completed, checking for accounts...');
    
    // Wait a moment for the connection to establish
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Method 1: Try using request to get accounts (most reliable)
    let accounts: string[] = [];
    try {
      const requestedAccounts = await provider.request({ method: 'eth_accounts' });
      if (Array.isArray(requestedAccounts)) {
        accounts = requestedAccounts;
        console.log('Accounts from request method:', accounts);
      }
    } catch (e) {
      console.log('Request method failed, trying alternatives:', e);
    }
    
    // Method 2: Check provider.accounts directly
    if (accounts.length === 0 && provider.accounts && Array.isArray(provider.accounts)) {
      accounts = provider.accounts;
      console.log('Accounts from provider.accounts:', accounts);
    }
    
    // Method 3: Wait for connect event if still no accounts
    if (accounts.length === 0) {
      console.log('No accounts yet, waiting for connect event...');
      const accountsPromise = new Promise<string[]>((resolve) => {
        const timeout = setTimeout(() => {
          resolve([]);
        }, 5000);
        
        const connectHandler = () => {
          clearTimeout(timeout);
          setTimeout(() => {
            const accs = provider.accounts || [];
            console.log('Accounts from connect event:', accs);
            provider.off('connect', connectHandler);
            resolve(accs);
          }, 500);
        };
        
        provider.once('connect', connectHandler);
      });
      
      accounts = await accountsPromise;
    }
    
    // Final check: try request one more time
    if (accounts.length === 0) {
      try {
        const finalAccounts = await provider.request({ method: 'eth_accounts' });
        if (Array.isArray(finalAccounts) && finalAccounts.length > 0) {
          accounts = finalAccounts;
          console.log('Accounts from final request:', accounts);
        }
      } catch (e) {
        console.log('Final request also failed');
      }
    }
    
    if (accounts.length > 0) {
      const accountAddress = accounts[0];
      walletState.address = accountAddress;
      walletState.isConnected = true;
      saveWalletState();
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
      }
      
      console.log('Wallet connected successfully:', accountAddress);
      return accountAddress;
    }
    
    // If we still don't have accounts, check if user rejected
    if (!provider.connected) {
      throw new Error('Connection was rejected or cancelled. Please try again and approve the connection.');
    }
    
    throw new Error('Unable to retrieve wallet accounts. Please make sure your wallet is unlocked and try again.');
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    
    // Handle specific error cases
    if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
      throw new Error('Connection was rejected. Please try again and approve the connection.');
    }
    
    if (error?.message?.includes('User closed') || error?.message?.includes('closed') || error?.message?.includes('cancelled')) {
      throw new Error('Connection window was closed. Please try again.');
    }
    
    if (error?.code === 'USER_REJECTED' || error?.code === 4001) {
      throw new Error('Connection was rejected. Please approve the connection request.');
    }
    
    // More user-friendly error messages
    const errorMessage = error?.message || 'Unknown error occurred';
    
    if (errorMessage.includes('Project ID')) {
      throw new Error('WalletConnect configuration error. Please contact support.');
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Don't wrap the error message if it's already user-friendly
    if (errorMessage.includes('Unable to retrieve') || errorMessage.includes('Connection was rejected')) {
      throw error;
    }
    
    throw new Error(`Failed to connect wallet: ${errorMessage}. Please try again.`);
  }
};

export const disconnectWallet = async () => {
  if (walletState.provider) {
    try {
      await walletState.provider.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }
  walletState.address = null;
  walletState.isConnected = false;
  walletState.provider = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('walletState');
    window.dispatchEvent(new CustomEvent('walletStateChanged'));
  }
};

export const getWalletAddress = (): string | null => {
  return walletState.address;
};

export const isWalletConnected = (): boolean => {
  return walletState.isConnected && walletState.address !== null;
};

export const getProvider = (): any | null => {
  return walletState.provider;
};
