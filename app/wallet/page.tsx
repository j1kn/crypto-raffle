'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAccount, useBalance } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Wallet, ArrowLeft, Copy, ExternalLink, RefreshCw, Swap } from 'lucide-react';
import Link from 'next/link';
import { formatUnits } from 'viem';

export default function WalletPage() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const chainId = chain?.id;
  const { open } = useWeb3Modal();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get native token balance
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (!address && !isConnected) {
      router.push('/');
      return;
    }
  }, [address, isConnected, router]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBalance();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getExplorerUrl = (address: string) => {
    if (!chain) return '#';
    const chainId = chain.id;
    
    // Common explorer URLs
    if (chainId === 1) return `https://etherscan.io/address/${address}`; // Ethereum
    if (chainId === 8453) return `https://basescan.org/address/${address}`; // Base
    if (chainId === 137) return `https://polygonscan.com/address/${address}`; // Polygon
    if (chainId === 56) return `https://bscscan.com/address/${address}`; // BSC
    if (chainId === 42161) return `https://arbiscan.io/address/${address}`; // Arbitrum
    if (chainId === 10) return `https://optimistic.etherscan.io/address/${address}`; // Optimism
    
    // Default to etherscan
    return `https://etherscan.io/address/${address}`;
  };

  const getSwapUrl = () => {
    if (!chain) return 'https://app.uniswap.org/';
    const chainId = chain.id;
    
    // Chain-specific swap URLs
    if (chainId === 1) return 'https://app.uniswap.org/'; // Ethereum
    if (chainId === 8453) return 'https://app.uniswap.org/?chain=base'; // Base
    if (chainId === 137) return 'https://app.uniswap.org/?chain=polygon'; // Polygon
    if (chainId === 56) return 'https://pancakeswap.finance/swap'; // BSC
    if (chainId === 42161) return 'https://app.uniswap.org/?chain=arbitrum'; // Arbitrum
    if (chainId === 10) return 'https://app.uniswap.org/?chain=optimism'; // Optimism
    
    // Default to Uniswap
    return 'https://app.uniswap.org/';
  };

  if (!address && !isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to view your wallet.</p>
            <button
              onClick={() => open()}
              className="bg-primary-green text-primary-darker px-6 py-3 rounded font-semibold hover:bg-primary-green/90 transition-colors"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedBalance = balance ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4) : '0.0000';
  const symbol = balance?.symbol || chain?.nativeCurrency?.symbol || 'ETH';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-green transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Wallet className="w-10 h-10 text-primary-green" />
              WALLET
            </h1>
            <p className="text-gray-400">View your balance and manage your assets</p>
          </div>

          {/* Wallet Address Card */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
                <div className="flex items-center gap-3">
                  <p className="text-primary-green font-mono break-all text-sm md:text-base">
                    {address}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 text-gray-400 hover:text-primary-green transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-primary-green text-sm">Copied!</span>
                  )}
                </div>
              </div>
              <a
                href={getExplorerUrl(address || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary-green hover:text-primary-green/80 transition-colors"
              >
                View on Explorer
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            {chain && (
              <div className="mt-4 pt-4 border-t border-primary-lightgray">
                <p className="text-sm text-gray-400 mb-1">Network</p>
                <p className="text-white font-semibold">{chain.name}</p>
              </div>
            )}
          </div>

          {/* Balance Card */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary-green" />
                Balance
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing || balanceLoading}
                className="p-2 text-gray-400 hover:text-primary-green transition-colors disabled:opacity-50"
                title="Refresh balance"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {balanceLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-green mx-auto mb-2" />
                <p className="text-gray-400">Loading balance...</p>
              </div>
            ) : (
              <div className="bg-primary-darker rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Native Token</p>
                  <p className="text-primary-green font-mono text-xs">{symbol}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white">{formattedBalance}</p>
                  <p className="text-xl text-gray-400">{symbol}</p>
                </div>
                {balance && (
                  <p className="text-gray-500 text-sm mt-2">
                    ≈ ${(parseFloat(formattedBalance) * 0).toFixed(2)} USD
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Swap Section */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Swap className="w-6 h-6 text-primary-orange" />
              Swap Tokens
            </h2>
            <p className="text-gray-400 mb-6">
              Swap your tokens using decentralized exchanges. We recommend using Uniswap for most chains.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={getSwapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-darker border-2 border-primary-green rounded-lg p-6 hover:border-primary-green/80 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Uniswap</h3>
                  <ExternalLink className="w-5 h-5 text-primary-green group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm">
                  Swap tokens on {chain?.name || 'your network'} using Uniswap
                </p>
              </a>

              <a
                href="https://app.1inch.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-darker border-2 border-primary-orange rounded-lg p-6 hover:border-primary-orange/80 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">1inch</h3>
                  <ExternalLink className="w-5 h-5 text-primary-orange group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm">
                  DEX aggregator for best swap rates across multiple exchanges
                </p>
              </a>
            </div>

            {chainId === 56 && (
              <a
                href="https://pancakeswap.finance/swap"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block bg-primary-darker border-2 border-yellow-500 rounded-lg p-6 hover:border-yellow-500/80 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">PancakeSwap</h3>
                  <ExternalLink className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm">
                  Popular DEX for Binance Smart Chain
                </p>
              </a>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-primary-darker border border-primary-lightgray rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-3">Wallet Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">{chain?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chain ID:</span>
                <span className="text-white">{chainId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Native Currency:</span>
                <span className="text-white">{chain?.nativeCurrency?.symbol || symbol}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

