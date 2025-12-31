'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Trophy, Clock, ExternalLink, LogOut, User, Settings, CheckCircle, Hourglass, Shield, Share2, ArrowRight, Copy } from 'lucide-react';
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
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
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

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
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
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Show connect wallet message if no address
  if (!address && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to view your dashboard.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 md:py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <Link
              href="/settings"
              className="flex items-center gap-2 bg-primary-gray border border-primary-lightgray text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-darker hover:border-primary-green transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>

          {/* Profile Header - Refined */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-xl p-6 md:p-8 mb-10 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Picture - Larger */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary-darker border-2 border-primary-green/30 overflow-hidden flex items-center justify-center ring-2 ring-primary-green/10">
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.display_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 md:w-14 md:h-14 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Profile Info - Enhanced Typography */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {profile?.display_name || 'Anonymous User'}
                  </h2>
                  {isConnected && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-green/10 border border-primary-green/20 rounded-md">
                      <Shield className="w-3.5 h-3.5 text-primary-green" />
                      <span className="text-xs font-semibold text-primary-green">Connected</span>
                    </div>
                  )}
                </div>
                
                {/* Wallet Address - Secondary Styling */}
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-400 font-mono text-xs md:text-sm break-all">
                    {address}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="flex-shrink-0 p-1.5 text-gray-500 hover:text-primary-green hover:bg-primary-darker rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Email - Subtle */}
                {profile?.email && (
                  <p className="text-gray-500 text-sm mb-4">{profile.email}</p>
                )}
                
                {!profile && (
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 text-primary-green hover:text-primary-green/80 text-sm font-medium transition-colors"
                  >
                    Complete your profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Actions - Refined */}
              <div className="flex flex-col gap-2.5 md:min-w-[140px]">
                <button
                  onClick={() => open()}
                  className="flex items-center justify-center gap-2 bg-primary-darker border border-primary-lightgray text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-dark hover:border-primary-green transition-all duration-200 text-sm"
                >
                  <User className="w-4 h-4" />
                  Switch Wallet
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-2 bg-primary-orange/10 border border-primary-orange/20 text-primary-orange px-4 py-2.5 rounded-lg font-medium hover:bg-primary-orange/20 transition-all duration-200 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards - Refined with Consistent Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
            <div className="bg-primary-gray border border-primary-lightgray rounded-xl p-6 hover:border-primary-green/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-green/5 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-green/10 rounded-lg group-hover:bg-primary-green/20 transition-colors">
                  <Hourglass className="w-5 h-5 text-primary-green" />
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Active Raffles</h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.activeRaffles}</p>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-xl p-6 hover:border-primary-green/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-green/5 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-orange/10 rounded-lg group-hover:bg-primary-orange/20 transition-colors">
                  <Trophy className="w-5 h-5 text-primary-orange" />
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Entries</h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.totalEntries}</p>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-xl p-6 hover:border-primary-green/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-green/5 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-orange/10 rounded-lg group-hover:bg-primary-orange/20 transition-colors">
                  <Clock className="w-5 h-5 text-primary-orange" />
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Pending Draws</h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.pendingDraws}</p>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-xl p-6 hover:border-primary-green/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-green/5 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-green/10 rounded-lg group-hover:bg-primary-green/20 transition-colors">
                  <CheckCircle className="w-5 h-5 text-primary-green" />
                </div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Wins</h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.wins}</p>
            </div>
          </div>

          {/* My Raffle Entries - List Style */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">My Raffle Entries</h2>
              {entries.length > 0 && (
                <span className="text-gray-400 text-sm">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
              )}
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center text-gray-400 py-16 bg-primary-gray border border-primary-lightgray rounded-xl">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2 text-lg">You haven't entered any raffles yet.</p>
                <Link
                  href="/raffles"
                  className="text-primary-green hover:text-primary-green/80 inline-flex items-center gap-2 font-medium transition-colors mt-4"
                >
                  Browse Active Raffles
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-primary-gray border border-primary-lightgray rounded-xl overflow-hidden hover:border-primary-green/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-green/5"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      {entry.raffles.image_url && (
                        <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-auto bg-primary-darker flex-shrink-0">
                          <img
                            src={entry.raffles.image_url}
                            alt={entry.raffles.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Title and Status */}
                            <div className="flex items-start gap-3 mb-4">
                              <h3 className="text-xl font-bold text-white flex-1">
                                {entry.raffles.title}
                              </h3>
                              {/* Status Badge */}
                              {entry.raffles.status === 'live' && (
                                <span className="px-3 py-1 bg-primary-green/20 border border-primary-green/30 text-primary-green text-xs font-semibold rounded-full whitespace-nowrap">
                                  ACTIVE
                                </span>
                              )}
                              {entry.raffles.status === 'completed' && entry.isWin && (
                                <span className="px-3 py-1 bg-primary-orange/20 border border-primary-orange/30 text-primary-orange text-xs font-semibold rounded-full whitespace-nowrap">
                                  WON
                                </span>
                              )}
                              {entry.raffles.status === 'completed' && !entry.isWin && (
                                <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 text-gray-400 text-xs font-semibold rounded-full whitespace-nowrap">
                                  ENDED
                                </span>
                              )}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Trophy className="w-4 h-4 text-primary-green flex-shrink-0" />
                                <span className="text-gray-400">Prize:</span>
                                <span className="text-white font-semibold">
                                  {entry.raffles.prize_pool_symbol} {entry.raffles.prize_pool_amount.toLocaleString()}
                                </span>
                              </div>
                              
                              {entry.raffles.status === 'live' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-primary-orange flex-shrink-0" />
                                  <span className="text-gray-400">Ends:</span>
                                  <CountdownTimer endDate={entry.raffles.ends_at} className="text-xs" />
                                </div>
                              )}
                              
                              {entry.quantity && entry.quantity > 1 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">Tickets:</span>
                                  <span className="text-white font-semibold">{entry.quantity}</span>
                                </div>
                              )}
                              
                              {entry.tx_hash && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">Transaction:</span>
                                  <a
                                    href={`https://etherscan.io/tx/${entry.tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-green font-mono hover:underline text-xs"
                                  >
                                    {entry.tx_hash.slice(0, 8)}...{entry.tx_hash.slice(-6)}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-row md:flex-col gap-2 md:min-w-[120px]">
                            <Link
                              href={`/raffles/${entry.raffle_id}`}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-green text-primary-darker px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-green/90 transition-all duration-200 text-sm"
                            >
                              View
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                            {entry.raffles.status === 'live' && (
                              <Link
                                href={`/raffles/${entry.raffle_id}`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-darker border border-primary-lightgray text-white px-4 py-2.5 rounded-lg font-medium hover:border-primary-green transition-all duration-200 text-sm"
                              >
                                Enter More
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

