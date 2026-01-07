/**
 * Payment methods configuration for Ethereum Mainnet
 * All methods use chain ID 1 (Ethereum Mainnet) for mobile compatibility
 */

export interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  chainId: number; // Always 1 for Ethereum Mainnet
  isNative: boolean; // true for ETH, false for ERC-20 tokens
  contractAddress?: string; // ERC-20 token contract address
  decimals: number;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    isNative: true,
    decimals: 18,
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    chainId: 1,
    isNative: false,
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    chainId: 1,
    isNative: false,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
];

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(method => method.id === id);
}

export function getDefaultPaymentMethod(): PaymentMethod {
  return PAYMENT_METHODS[0]; // Default to ETH
}

