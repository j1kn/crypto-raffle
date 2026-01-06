'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InfoBanner from '@/components/InfoBanner';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RaffleCard from '@/components/RaffleCard';
import CountdownTimer from '@/components/CountdownTimer';

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
  const [heroRaffle, setHeroRaffle] = useState<Raffle | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      await fetchHeroRaffle();
      await fetchRaffles();
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      <InfoBanner />
      
      {/* Hero Raffle Section - Full Screen */}
      {heroRaffle && (
        <section className="w-screen h-screen overflow-hidden">
          <div className="w-full h-full bg-[#1a1a1a] border-b border-[#2a2a2a]">
            {/* Timer at Top - Centered */}
            <div className="relative p-4 min-h-[60px] flex items-center justify-center bg-[#0f0f0f] border-b border-[#2a2a2a]">
              <div className="z-10">
                <CountdownTimer endDate={heroRaffle.ends_at} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-60px)]">
              {/* Image */}
              {heroRaffle.image_url && (
                <div className="relative w-full h-full bg-[#0f0f0f] lg:col-span-1">
                  <img
                    src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                    alt={heroRaffle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 to-transparent"></div>
                </div>
              )}
              
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center lg:col-span-2 h-full">
                <div className="mb-4">
                  <span className="bg-[#00d97e] text-[#0a0a0a] px-3 py-1 rounded-full text-xs font-bold">
                    FEATURED RAFFLE
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-4">
                  {heroRaffle.title}
                </h1>
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Prize Pool</p>
                    <p className="text-2xl font-bold text-[#00d97e]">
                      {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Entry Price</p>
                    <p className="text-xl font-bold text-[#f5f5f5]">
                      {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/raffles/${heroRaffle.id}`}
                    className="bg-[#00d97e] text-[#0a0a0a] px-8 py-4 rounded font-bold text-lg hover:bg-[#00c46a] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    ENTER NOW
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Raffles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-4">
              Live Raffles
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {raffles.map((raffle, index) => {
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

      <Footer />
    </div>
  );
}
