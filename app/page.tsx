'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import TrustStatsBar from '@/components/TrustStatsBar';
import HowItWorks from '@/components/HowItWorks';
import RecentActivity from '@/components/RecentActivity';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RaffleCard from '@/components/RaffleCard';

interface Raffle {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prize_pool_amount: number;
  prize_pool_symbol: string;
  ticket_price: number;
  max_tickets: number;
  status: string;
  ends_at: string;
  starts_at: string | null;
}

interface Winner {
  raffle_id: string;
  raffle_title: string;
  winner_wallet: string;
  drawn_at: string;
  prize_pool_amount: number;
  prize_pool_symbol: string;
}

export default function HomePage() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [heroRaffle, setHeroRaffle] = useState<Raffle | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});
  const [totalPaidOut, setTotalPaidOut] = useState<string>('0 ETH');
  const [completedDraws, setCompletedDraws] = useState<number>(0);
  const [lastDrawTime, setLastDrawTime] = useState<string>('N/A');

  useEffect(() => {
    const loadData = async () => {
      await fetchHeroRaffle();
      await fetchRaffles();
      await fetchRecentWinners();
      await fetchTrustStats();
    };
    loadData();
  }, []);

  useEffect(() => {
    // Refetch raffles when hero raffle changes to exclude it
    if (heroRaffle) {
      fetchRaffles();
    }
  }, [heroRaffle]);

  const fetchHeroRaffle = async () => {
    try {
      // Fetch the most recent live raffle as hero (always shows at top)
      // Only shows live raffles, completed raffles are automatically excluded
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .eq('status', 'live')  // Only live raffles
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setHeroRaffle(data);
      } else {
        // No hero raffle available
        setHeroRaffle(null);
      }
    } catch (error) {
      console.error('Error fetching hero raffle:', error);
      setHeroRaffle(null);
    }
  };

  const fetchRaffles = async () => {
    try {
      // Fetch live raffles only (completed raffles are automatically excluded)
      // Completed raffles are moved to winners section automatically
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .eq('status', 'live')  // Only show live raffles, completed ones are removed
        .order('created_at', { ascending: false })
        .limit(7); // Fetch 7 to account for hero raffle exclusion

      if (error) {
        console.error('Error fetching raffles:', error);
      } else {
        // Exclude hero raffle from the regular raffles list
        const heroId = heroRaffle?.id;
        const filteredRaffles = heroId 
          ? (data || []).filter(r => r.id !== heroId).slice(0, 6)
          : (data || []).slice(0, 6);
        setRaffles(filteredRaffles);
        
        // Fetch entry counts for all raffles
        if (filteredRaffles.length > 0) {
          fetchEntryCounts(filteredRaffles.map(r => r.id));
        }
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntryCounts = async (raffleIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('raffle_entries')
        .select('raffle_id, quantity')
        .in('raffle_id', raffleIds);

      if (error) {
        console.error('Error fetching entry counts:', error);
        return;
      }

      // Calculate total entries per raffle
      const counts: Record<string, number> = {};
      raffleIds.forEach(id => {
        counts[id] = 0;
      });

      (data || []).forEach((entry: any) => {
        const raffleId = entry.raffle_id;
        const quantity = entry.quantity || 1;
        if (counts[raffleId] !== undefined) {
          counts[raffleId] += quantity;
        }
      });

      setEntryCounts(counts);
    } catch (error) {
      console.error('Error fetching entry counts:', error);
    }
  };

  const fetchTrustStats = async () => {
    try {
      // Fetch completed raffles to calculate stats
      const { data, error } = await supabase
        .from('raffles')
        .select('prize_pool_amount, prize_pool_symbol, winner_drawn_at')
        .eq('status', 'completed')
        .not('winner_drawn_at', 'is', null)
        .order('winner_drawn_at', { ascending: false });

      if (error) {
        console.error('Error fetching trust stats:', error);
        return;
      }

      // Calculate total paid out
      let total = 0;
      const symbol = data?.[0]?.prize_pool_symbol || 'ETH';
      (data || []).forEach((raffle: any) => {
        total += raffle.prize_pool_amount || 0;
      });

      setTotalPaidOut(`${total.toFixed(2)} ${symbol}`);
      setCompletedDraws(data?.length || 0);

      // Format last draw time
      if (data && data.length > 0 && data[0].winner_drawn_at) {
        const lastDraw = new Date(data[0].winner_drawn_at);
        const now = new Date();
        const diffMs = now.getTime() - lastDraw.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 24) {
          setLastDrawTime(`${diffHours}h ago`);
        } else if (diffDays < 7) {
          setLastDrawTime(`${diffDays}d ago`);
        } else {
          setLastDrawTime(lastDraw.toLocaleDateString());
        }
      }
    } catch (error) {
      console.error('Error fetching trust stats:', error);
    }
  };

  const convertGoogleDriveUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Convert Google Drive share link to direct image URL
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
      // Try alternative format
      const altMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (altMatch) {
        return `https://drive.google.com/uc?export=view&id=${altMatch[1]}`;
      }
    }
    
    return url;
  };

  const fetchRecentWinners = async () => {
    try {
      // Fetch recent winners
      const { data, error } = await supabase
        .from('raffles')
        .select(`
          id,
          title,
          winner_user_id,
          winner_drawn_at,
          prize_pool_amount,
          prize_pool_symbol,
          users!winner_user_id (
            wallet_address
          )
        `)
        .not('winner_user_id', 'is', null)
        .eq('status', 'completed')
        .order('winner_drawn_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const winnersList: Winner[] = (data || [])
        .filter((raffle: any) => raffle.users)
        .map((raffle: any) => ({
          raffle_id: raffle.id,
          raffle_title: raffle.title,
          winner_wallet: raffle.users.wallet_address,
          drawn_at: raffle.winner_drawn_at,
          prize_pool_amount: raffle.prize_pool_amount,
          prize_pool_symbol: raffle.prize_pool_symbol,
        }));

      setRecentWinners(winnersList);
    } catch (error) {
      console.error('Error fetching recent winners:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      {/* Hero Section */}
      <Hero heroRaffle={heroRaffle} />

      {/* Trust Stats Bar */}
      <TrustStatsBar
        totalPaidOut={totalPaidOut}
        completedDraws={completedDraws}
        lastDrawTime={lastDrawTime}
      />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Active Raffles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-4">
              Active Raffles
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Enter current draws with fixed rules and scheduled execution
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">
              Loading raffles...
            </div>
          ) : raffles.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p className="mb-4">No active raffles at the moment.</p>
              <p className="text-sm">Check back soon for new draws.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {raffles.map((raffle, index) => {
                // Alternate badge colors for visual variety
                const badgeColor = index === 1 ? 'orange' : 'green';
                return (
                  <RaffleCard
                    key={raffle.id}
                    id={raffle.id}
                    title={raffle.title}
                    imageUrl={raffle.image_url || undefined}
                    prizePool={raffle.prize_pool_amount.toString()}
                    prizeSymbol={raffle.prize_pool_symbol}
                    ticketPrice={raffle.ticket_price.toString()}
                    maxTickets={raffle.max_tickets}
                    endDate={raffle.ends_at}
                    prizePlaces={Math.max(1, Math.floor(raffle.max_tickets / 10))}
                    badgeColor={badgeColor}
                    entryCount={entryCounts[raffle.id] || 0}
                  />
                );
              })}
            </div>
          )}

          {/* View All Raffles Link */}
          {raffles.length > 0 && (
            <div className="text-center">
              <Link
                href="/raffles"
                className="inline-flex items-center gap-2 text-[#00d97e] hover:text-[#00c46a] font-semibold transition-colors"
              >
                View All Raffles
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Winners Section */}
      {recentWinners.length > 0 && (
        <section className="py-20 px-4 bg-[#0f0f0f] border-t border-[#2a2a2a]">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <p className="text-primary-orange text-sm font-semibold mb-2">RECENT WINNERS</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#f5f5f5] mb-4">
                Completed Draws
              </h2>
              <div className="w-24 h-1 bg-primary-orange mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentWinners.slice(0, 6).map((winner, index) => (
                <div
                  key={winner.raffle_id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-primary-orange/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 
                        ? 'bg-primary-orange text-white' 
                        : 'bg-[#00d97e]/20 text-[#00d97e]'
                    }`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Winner #{index + 1}</p>
                      <p className="text-sm font-semibold text-[#f5f5f5]">Completed</p>
                    </div>
                  </div>

                  <h3 className="text-[#f5f5f5] font-bold text-lg mb-3 line-clamp-2">
                    {winner.raffle_title}
                  </h3>

                  <div className="bg-[#0f0f0f] rounded-lg p-3 mb-3">
                    <p className="text-gray-500 text-xs mb-1">Winner Address</p>
                    <p className="text-[#00d97e] font-mono text-xs break-all">
                      {winner.winner_wallet.slice(0, 6)}...{winner.winner_wallet.slice(-4)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Prize Paid</p>
                      <p className="text-primary-orange font-bold">
                        {winner.prize_pool_symbol} {winner.prize_pool_amount.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/raffles/${winner.raffle_id}`}
                      className="text-[#00d97e] hover:text-[#00c46a] text-sm transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/winners"
                className="inline-flex items-center gap-2 text-primary-orange hover:text-primary-orange/80 font-semibold transition-colors"
              >
                View All Winners
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity Section (replaces Comments) */}
      <RecentActivity />

      <Footer />
    </div>
  );
}
