// WalletConnect integration with proper client-side only handling

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: any | null;
}

let walletState: WalletState = {
  address: null,
  isConnected: false,
  provider: null,
};

// Client-side only - WalletConnect needs NEXT_PUBLIC_ prefix
const getProjectId = (): string => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
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
      } else {
        walletState.address = null;
        walletState.isConnected = false;
      }
    });

    provider.on('chainChanged', () => {
      // Handle chain change if needed
    });

    provider.on('disconnect', () => {
      walletState.address = null;
      walletState.isConnected = false;
      walletState.provider = null;
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
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
};

export const disconnectWallet = async () => {
  if (walletState.provider) {
    try {
      await walletState.provider.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
    walletState.address = null;
    walletState.isConnected = false;
    walletState.provider = null;
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
