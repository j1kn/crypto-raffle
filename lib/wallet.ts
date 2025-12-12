import { EthereumProvider } from '@walletconnect/ethereum-provider';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: EthereumProvider | null;
}

let walletState: WalletState = {
  address: null,
  isConnected: false,
  provider: null,
};

// Client-side only - WalletConnect needs NEXT_PUBLIC_ prefix
const getProjectId = () => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
};

const projectId = getProjectId();

if (!projectId && typeof window !== 'undefined') {
  console.warn('WalletConnect Project ID not found. Make sure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set.');
}

export const initWalletConnect = async () => {
  if (walletState.provider) {
    return walletState.provider;
  }

  const provider = await EthereumProvider.init({
    projectId,
    chains: [1, 137, 56, 43114], // Ethereum, Polygon, BSC, Avalanche
    optionalChains: [42161, 10, 250], // Arbitrum, Optimism, Fantom
    showQrModal: true,
    metadata: {
      name: 'PrimePick Tournament',
      description: 'Crypto Raffle Platform',
      url: typeof window !== 'undefined' ? window.location.origin : '',
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
    await walletState.provider.disconnect();
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

export const getProvider = (): EthereumProvider | null => {
  return walletState.provider;
};

