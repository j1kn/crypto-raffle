// WalletConnect integration with proper client-side only handling

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

// Client-side only - WalletConnect needs NEXT_PUBLIC_ prefix
const getProjectId = (): string => {
  if (typeof window === 'undefined') return '';
  // Use the provided project ID or fallback to env variable
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '14470476d6df65c41949146d2a788698';
};

export const initWalletConnect = async () => {
  if (typeof window === 'undefined') {
    throw new Error('WalletConnect can only be initialized on the client side');
  }

  if (walletState.provider) {
    return walletState.provider;
  }

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('WalletConnect Project ID not found. Make sure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set.');
  }

  try {
    // Dynamic import to avoid SSR issues
    const EthereumProviderModule = await import('@walletconnect/ethereum-provider');
    const EthereumProvider = (EthereumProviderModule as any).default || EthereumProviderModule;

    // Use type assertion to bypass TypeScript checking for the init method
    const ProviderClass = EthereumProvider as any;
    
    if (!ProviderClass || typeof ProviderClass.init !== 'function') {
      throw new Error('WalletConnect EthereumProvider not available');
    }

    const provider = await ProviderClass.init({
      projectId,
      chains: [1, 137, 56, 43114], // Ethereum, Polygon, BSC, Avalanche
      optionalChains: [42161, 10, 250], // Arbitrum, Optimism, Fantom
      showQrModal: true,
      metadata: {
        name: 'PrimePick Tournament',
        description: 'Crypto Raffle Platform',
        url: window.location.origin,
        icons: [],
      },
    });

    walletState.provider = provider;

    // Set up event listeners
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        walletState.address = accounts[0];
        walletState.isConnected = true;
        saveWalletState();
        // Dispatch custom event for UI updates
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
      // Handle chain change if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
      }
    });

    provider.on('disconnect', () => {
      walletState.address = null;
      walletState.isConnected = false;
      walletState.provider = null;
      saveWalletState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
        localStorage.removeItem('walletState');
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
    const provider = await initWalletConnect();
    const accounts = await provider.enable();
    
    if (accounts && accounts.length > 0) {
      walletState.address = accounts[0];
      walletState.isConnected = true;
      saveWalletState();
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletStateChanged'));
      }
      
      return accounts[0];
    }
    return null;
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    // User might have rejected the connection
    if (error?.message?.includes('User rejected')) {
      throw new Error('Connection rejected. Please try again.');
    }
    throw error;
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
