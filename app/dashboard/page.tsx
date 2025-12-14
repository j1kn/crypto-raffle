'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Trophy, Clock, ExternalLink, LogOut } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import Link from 'next/link';

interface RaffleEntry {
  id: string;
  raffle_id: string;
  tx_hash: string | null;
  created_at: string;
  raffles: {
    title: string;
    image_url: string | null;
    prize_pool_amount: number;
    prize_pool_symbol: string;
    ends_at: string;
    status: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  useEffect(() => {
    if (!isConnected) {
      // Don't auto-redirect, just show connect modal
      open();
    }
  }, [isConnected, open]);

  useEffect(() => {
    if (address) {
      fetchEntries();
    }
  }, [address]);

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
        setLoading(false);
        return;
      }

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
            status
          )
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries((data as any) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            DASHBOARD
          </h1>

          {/* Wallet Address */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Connected Wallet</h2>
                <p className="text-primary-green font-mono">{address}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 bg-primary-orange text-white px-4 py-2 rounded font-semibold hover:bg-primary-orange/90 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                DISCONNECT
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-lightgray">
              <button
                onClick={() => open()}
                className="text-primary-green hover:text-primary-green/80 text-sm font-medium"
              >
                Switch Wallet
              </button>
              <p className="text-gray-400 text-xs mt-1">Click to connect a different wallet</p>
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
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-primary-green" />
                          <span className="text-gray-400">Prize:</span>
                          <span className="text-primary-green font-semibold">
                            {entry.raffles.prize_pool_symbol} {entry.raffles.prize_pool_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary-orange" />
                          <span className="text-gray-400">Ends:</span>
                          <CountdownTimer endDate={entry.raffles.ends_at} className="text-xs" />
                        </div>
                        {entry.tx_hash && (
                          <div className="text-xs">
                            <span className="text-gray-400">TX:</span>
                            <span className="text-primary-green font-mono ml-2">
                              {entry.tx_hash.slice(0, 10)}...
                            </span>
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

