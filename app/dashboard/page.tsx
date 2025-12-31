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
import { Trophy, Clock, ExternalLink, LogOut, User, Settings, CheckCircle, Hourglass } from 'lucide-react';
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
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              DASHBOARD
            </h1>
            <Link
              href="/settings"
              className="flex items-center gap-2 bg-primary-darker text-white px-4 py-2 rounded font-semibold hover:bg-primary-gray transition-colors"
            >
              <Settings className="w-4 h-4" />
              SETTINGS
            </Link>
          </div>

          {/* Profile Card */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary-darker border-2 border-primary-lightgray overflow-hidden flex items-center justify-center">
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.display_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile?.display_name || 'Anonymous User'}
                </h2>
                <p className="text-primary-green font-mono text-sm break-all mb-2">
                  {address}
                </p>
                {profile?.email && (
                  <p className="text-gray-400 text-sm">{profile.email}</p>
                )}
                {!profile && (
                  <Link
                    href="/settings"
                    className="inline-block mt-2 text-primary-green hover:text-primary-green/80 text-sm font-medium"
                  >
                    Complete your profile →
                  </Link>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-2 bg-primary-orange text-white px-4 py-2 rounded font-semibold hover:bg-primary-orange/90 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  DISCONNECT
                </button>
                <button
                  onClick={() => open()}
                  className="text-primary-green hover:text-primary-green/80 text-sm font-medium text-center"
                >
                  Switch Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Hourglass className="w-5 h-5 text-primary-green" />
                <h3 className="text-gray-400 text-sm font-semibold uppercase">Active Raffles</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.activeRaffles}</p>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-primary-orange" />
                <h3 className="text-gray-400 text-sm font-semibold uppercase">Total Entries</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalEntries}</p>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-primary-orange" />
                <h3 className="text-gray-400 text-sm font-semibold uppercase">Pending Draws</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.pendingDraws}</p>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-primary-green" />
                <h3 className="text-gray-400 text-sm font-semibold uppercase">Wins</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.wins}</p>
            </div>
          </div>

          {/* My Raffles */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Raffle Entries</h2>
            
            {entries.length === 0 ? (
              <div className="text-center text-gray-400 py-12 bg-primary-gray border border-primary-lightgray rounded-lg">
                <p className="mb-4">You haven't entered any raffles yet.</p>
                <Link
                  href="/raffles"
                  className="text-primary-green hover:underline inline-flex items-center gap-2"
                >
                  Browse Active Raffles
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-primary-gray border border-primary-lightgray rounded-lg overflow-hidden hover:border-primary-green transition-all"
                  >
                    {entry.raffles.image_url && (
                      <div className="relative w-full h-48 bg-primary-darker">
                        <img
                          src={entry.raffles.image_url}
                          alt={entry.raffles.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-white font-bold text-lg mb-4">
                        {entry.raffles.title}
                      </h3>
                      
                      <div className="space-y-3 mb-4">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {entry.raffles.status === 'live' && (
                            <span className="px-2 py-1 bg-primary-green/20 text-primary-green text-xs font-semibold rounded">
                              ACTIVE
                            </span>
                          )}
                          {entry.raffles.status === 'completed' && entry.isWin && (
                            <span className="px-2 py-1 bg-primary-orange/20 text-primary-orange text-xs font-semibold rounded">
                              WON
                            </span>
                          )}
                          {entry.raffles.status === 'completed' && !entry.isWin && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded">
                              ENDED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-primary-green" />
                          <span className="text-gray-400">Prize:</span>
                          <span className="text-primary-green font-semibold">
                            {entry.raffles.prize_pool_symbol} {entry.raffles.prize_pool_amount.toLocaleString()}
                          </span>
                        </div>
                        {entry.raffles.status === 'live' && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary-orange" />
                            <span className="text-gray-400">Ends:</span>
                            <CountdownTimer endDate={entry.raffles.ends_at} className="text-xs" />
                          </div>
                        )}
                        {entry.quantity && entry.quantity > 1 && (
                          <div className="text-sm">
                            <span className="text-gray-400">Tickets:</span>
                            <span className="text-white font-semibold ml-2">{entry.quantity}</span>
                          </div>
                        )}
                        {entry.tx_hash && (
                          <div className="text-xs">
                            <span className="text-gray-400">TX:</span>
                            <a
                              href={`https://etherscan.io/tx/${entry.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-green font-mono ml-2 hover:underline"
                            >
                              {entry.tx_hash.slice(0, 10)}...
                            </a>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/raffles/${entry.raffle_id}`}
                        className="block w-full bg-primary-green text-primary-darker py-2 rounded text-center font-semibold hover:bg-primary-green/90 transition-colors"
                      >
                        VIEW RAFFLE
                      </Link>
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

