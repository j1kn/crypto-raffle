'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

  // Removed auto-redirect - let users browse raffles even when connected
  // They can access dashboard via header button

  useEffect(() => {
    const loadData = async () => {
      await fetchHeroRaffle();
      await fetchRaffles();
      await fetchRecentWinners();
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
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Raffle Section - Always at Top */}
      {heroRaffle && (
        <section className="relative bg-gradient-to-b from-primary-darker to-primary-dark py-12 px-4">
          <div className="container mx-auto">
            <div className="bg-primary-gray border-2 border-primary-green rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image */}
                {heroRaffle.image_url && (
                  <div className="relative h-64 lg:h-full min-h-[300px] bg-primary-darker">
                    <img
                      src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                      alt={heroRaffle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent"></div>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="bg-primary-green text-primary-darker px-3 py-1 rounded-full text-xs font-bold">
                      FEATURED RAFFLE
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    {heroRaffle.title}
                  </h1>
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                      <p className="text-2xl font-bold text-primary-green">
                        {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Entry Price</p>
                      <p className="text-xl font-bold text-white">
                        {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/raffles/${heroRaffle.id}`}
                      className="bg-primary-green text-primary-darker px-8 py-4 rounded font-bold text-lg hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      ENTER NOW
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => open()}
                      className="bg-primary-orange text-white px-8 py-4 rounded font-bold text-lg hover:bg-primary-orange/90 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      CONNECT WALLET
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Heading Section */}
      <section className="relative bg-gradient-to-b from-primary-dark to-primary-dark py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            WIN PRIZES BEFORE CLOCK RUNS OUT
          </h1>
        </div>
      </section>

      {/* Play to Earn Games Section - Now Shows Live Raffles (cards only) */}
      <section className="py-20 px-4 bg-primary-dark">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center text-gray-400 py-12">
              Loading raffles...
            </div>
          ) : raffles.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p className="mb-4">No active raffles at the moment.</p>
              <p className="text-sm">Check back soon for new tournaments!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  />
                );
              })}
            </div>
          )}

          {/* View All Raffles Link */}
          {raffles.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/raffles"
                className="inline-flex items-center gap-2 text-primary-green hover:text-primary-green/80 font-semibold transition-colors"
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
        <section className="py-20 px-4 bg-primary-darker">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <p className="text-primary-orange text-sm font-semibold mb-2">RECENT WINNERS</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                CELEBRATING OUR CHAMPIONS
              </h2>
              <div className="w-24 h-1 bg-primary-orange mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentWinners.slice(0, 6).map((winner, index) => (
                <div
                  key={winner.raffle_id}
                  className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 hover:border-primary-orange transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 
                        ? 'bg-primary-orange text-white' 
                        : 'bg-primary-green/20 text-primary-green'
                    }`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Winner #{index + 1}</p>
                      <p className="text-sm font-semibold text-white">Champion</p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
                    {winner.raffle_title}
                  </h3>

                  <div className="bg-primary-darker rounded-lg p-3 mb-3">
                    <p className="text-gray-400 text-xs mb-1">Winner Address</p>
                    <p className="text-primary-green font-mono text-xs break-all">
                      {winner.winner_wallet.slice(0, 6)}...{winner.winner_wallet.slice(-4)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Prize Won</p>
                      <p className="text-primary-orange font-bold">
                        {winner.prize_pool_symbol} {winner.prize_pool_amount.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/raffles/${winner.raffle_id}`}
                      className="text-primary-green hover:text-primary-green/80 text-sm"
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

      <Footer />
    </div>
  );
}

