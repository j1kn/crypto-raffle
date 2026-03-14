'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InfoBanner from '@/components/InfoBanner';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Trophy, Clock, ExternalLink, LogOut, User, Settings, CheckCircle, Hourglass, Shield, Share2, ArrowRight, Copy, Activity, Wallet } from 'lucide-react';
import { getEtherscanTxUrl, formatTxHash } from '@/lib/etherscan';
import { useDisconnect } from 'wagmi';
import Link from 'next/link';

interface Profile {
  wallet_address: string;
  display_name: string;
  email?: string | null;
  profile_picture_url?: string | null;
}

interface RaffleEntry {
  id: string;
  raffle_id: string;
  tx_hash: string | null;
  created_at: string;
  quantity?: number;
  isWin?: boolean;
  raffles: {
    title: string;
    image_url: string | null;
    prize_pool_amount: number;
    prize_pool_symbol: string;
    ends_at: string;
    status: string;
    winner_user_id?: string | null;
  };
}

interface DashboardStats {
  activeRaffles: number;
  totalEntries: number;
  pendingDraws: number;
  wins: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { open, close: closeModal } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activeRaffles: 0,
    totalEntries: 0,
    pendingDraws: 0,
    wins: 0,
  });
  const [lastActivity, setLastActivity] = useState<string | null>(null);

  const handleDisconnect = () => {
    disconnect();
    // Force full page refresh to show disconnected state immediately
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 200);
  };

  const handleSwitchWallet = async () => {
    try {
      // Close any open modal first
      closeModal();
      // Disconnect current wallet
      disconnect();
      // Clear localStorage to ensure clean state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wagmi.wallet');
        localStorage.removeItem('wagmi.connected');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('wagmi.') || key.startsWith('wc@')) {
            localStorage.removeItem(key);
          }
        });
      }
      // Small delay to ensure disconnect completes, then open modal
      setTimeout(() => {
        open();
      }, 300);
    } catch (error) {
      console.error('Error switching wallet:', error);
      // If error occurs, just try to open the modal
      open();
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  useEffect(() => {
    // If no wallet is connected, redirect to home
    // This prevents getting stuck on dashboard
    if (!address && !isConnected) {
      router.push('/');
      return;
    }
  }, [address, isConnected, router]);

  useEffect(() => {
    if (address) {
      Promise.all([fetchProfile(), fetchEntries(), fetchStats()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [address]);

  const fetchProfile = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/profile?walletAddress=${address}`);
      const data = await response.json();

      if (response.ok && data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/dashboard/stats?walletAddress=${address}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEntries = async () => {
    if (!address) return;

    try {
      // Get user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address)
        .single();

      if (userError || !userData) {
        return;
      }

      const userId = userData.id;

      // Get entries with raffle details
      const { data, error } = await supabase
        .from('raffle_entries')
        .select(`
          *,
          raffles (
            title,
            image_url,
            prize_pool_amount,
            prize_pool_symbol,
            ends_at,
            status,
            winner_user_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map entries and mark wins
      const entriesWithWinStatus = (data || []).map((entry: any) => ({
        ...entry,
        isWin: entry.raffles?.winner_user_id === userId,
      }));
      
      setEntries(entriesWithWinStatus);

      // Set last activity from most recent entry
      if (entriesWithWinStatus.length > 0) {
        const mostRecent = entriesWithWinStatus[0];
        const date = new Date(mostRecent.created_at);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 24) {
          setLastActivity(`${diffHours}h ago`);
        } else if (diffDays < 7) {
          setLastActivity(`${diffDays}d ago`);
        } else {
          setLastActivity(date.toLocaleDateString());
        }
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Show connect wallet message if no address
  if (!address && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to view your account.</p>
            <button
              onClick={() => open()}
              className="bg-[#00d97e] text-[#0a0a0a] px-6 py-3 rounded font-semibold hover:bg-[#00c46a] transition-colors"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      <InfoBanner />
      
      <main className="flex-1 py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] tracking-tight">
              Account Dashboard
            </h1>
            <Link
              href="/settings"
              className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] px-4 py-2 rounded-lg font-medium hover:border-[#00d97e]/30 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>

          {/* Account Summary Header */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left: Account Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-5 h-5 text-[#00d97e]" />
                  <h2 className="text-lg font-semibold text-[#f5f5f5]">Account</h2>
                </div>
                
                {/* Wallet Address - Primary Identifier */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-[#f5f5f5] font-mono text-sm md:text-base break-all">
                    {address}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="flex-shrink-0 p-1.5 text-gray-500 hover:text-[#00d97e] hover:bg-[#0f0f0f] rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Status and Network Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {isConnected && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00d97e]"></div>
                      <span className="text-gray-400">Connected</span>
                    </div>
                  )}
                  {chain && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Network:</span>
                      <span className="text-[#f5f5f5]">{chain.name}</span>
                    </div>
                  )}
                  {lastActivity && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Last activity:</span>
                      <span className="text-gray-400">{lastActivity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col sm:flex-row gap-3 md:min-w-[200px]">
                <button
                  onClick={handleSwitchWallet}
                  className="flex items-center justify-center gap-2 bg-[#0f0f0f] border border-[#2a2a2a] text-[#f5f5f5] px-4 py-2.5 rounded-lg font-medium hover:border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  Switch Wallet
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-2 bg-[#0f0f0f] border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg font-medium hover:border-red-500/50 hover:bg-red-500/10 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Account Overview Stats */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <div className="mb-3">
                  <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Active Raffles</h3>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-[#f5f5f5]">{stats.activeRaffles}</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <div className="mb-3">
                  <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Entries</h3>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-[#f5f5f5]">{stats.totalEntries}</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <div className="mb-3">
                  <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Pending Draws</h3>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-[#f5f5f5]">{stats.pendingDraws}</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <div className="mb-3">
                  <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Payouts</h3>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-[#00d97e]">{stats.wins}</p>
              </div>
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#f5f5f5] mb-1">Activity Ledger</h2>
                <p className="text-sm text-gray-500">Entry history and execution records</p>
              </div>
              {entries.length > 0 && (
                <span className="text-gray-500 text-sm">{entries.length} {entries.length === 1 ? 'record' : 'records'}</span>
              )}
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center text-gray-500 py-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2 text-lg">No activity recorded.</p>
                <Link
                  href="/raffles"
                  className="text-[#00d97e] hover:text-[#00c46a] inline-flex items-center gap-2 font-medium transition-colors mt-4"
                >
                  Browse Active Raffles
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="divide-y divide-[#2a2a2a]">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-6 hover:bg-[#0f0f0f] transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Left: Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[#f5f5f5] font-semibold text-base mb-1 truncate">
                                {entry.raffles.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>Entry count: <span className="text-[#f5f5f5] font-medium">{entry.quantity || 1}</span></span>
                                {entry.raffles.status === 'live' && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Ends: <CountdownTimer endDate={entry.raffles.ends_at} className="text-xs" />
                                  </span>
                                )}
                                {entry.raffles.status === 'completed' && (
                                  <span className="text-gray-500">
                                    Ended: {new Date(entry.raffles.ends_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              {entry.raffles.status === 'live' && (
                                <span className="px-3 py-1 bg-[#00d97e]/10 border border-[#00d97e]/20 text-[#00d97e] text-xs font-medium rounded whitespace-nowrap">
                                  ACTIVE
                                </span>
                              )}
                              {entry.raffles.status === 'completed' && entry.isWin && (
                                <span className="px-3 py-1 bg-[#00d97e]/10 border border-[#00d97e]/20 text-[#00d97e] text-xs font-medium rounded whitespace-nowrap">
                                  PAID
                                </span>
                              )}
                              {entry.raffles.status === 'completed' && !entry.isWin && (
                                <span className="px-3 py-1 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs font-medium rounded whitespace-nowrap">
                                  EXECUTED
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Transaction and Prize Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {entry.tx_hash && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Transaction:</span>
                                <a
                                  href={getEtherscanTxUrl(entry.tx_hash, 1)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#00d97e] font-mono hover:underline text-xs flex items-center gap-1"
                                >
                                  {formatTxHash(entry.tx_hash)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Prize pool:</span>
                              <span className="text-[#f5f5f5] font-medium">
                                {entry.raffles.prize_pool_symbol} {entry.raffles.prize_pool_amount.toLocaleString()}
                              </span>
                            </div>
                            {entry.isWin && (
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <span className="text-[#00d97e] font-medium">Payout received</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[120px]">
                          <Link
                            href={`/raffles/${entry.raffle_id}`}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#00d97e] text-[#0a0a0a] px-4 py-2 rounded-lg font-semibold hover:bg-[#00c46a] transition-colors text-sm"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          {entry.raffles.status === 'live' && (
                            <Link
                              href={`/raffles/${entry.raffle_id}`}
                              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#0f0f0f] border border-[#2a2a2a] text-[#f5f5f5] px-4 py-2 rounded-lg font-medium hover:border-[#00d97e]/30 transition-colors text-sm"
                            >
                              Enter More
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
