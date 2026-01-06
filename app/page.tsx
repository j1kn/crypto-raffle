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
        <section className="relative w-screen h-[85vh] md:h-screen overflow-hidden">
          {/* Background Image */}
          {heroRaffle.image_url ? (
            <div className="absolute inset-0 w-full h-full">
              <img
                src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                alt={heroRaffle.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#0a0a0a]"></div>
          )}

          {/* Overlay - Radial Vignette + Linear Gradient */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(0,0,0,0.55), transparent 60%),
                linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%)
              `
            }}
          ></div>

          {/* Content - Desktop: Bottom-Left Title/Timer, Bottom-Right Button */}
          <div className="relative z-10 h-full">
            {/* Desktop Layout */}
            <div className="hidden md:block h-full">
              {/* Title + Timer - Bottom Left */}
              <div className="absolute bottom-0 left-0 pb-16 pl-16">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                  {heroRaffle.title}
                </h1>
                <div className="text-white text-lg lg:text-xl">
                  <CountdownTimer endDate={heroRaffle.ends_at} />
                </div>
              </div>

              {/* Button - Bottom Right */}
              <div className="absolute bottom-0 right-0 pb-16 pr-16">
                <Link
                  href={`/raffles/${heroRaffle.id}`}
                  className="inline-flex items-center justify-center bg-[#069852] text-white px-8 py-3 rounded-lg font-semibold text-base hover:bg-[#058a47] transition-colors"
                >
                  Enter Now
                </Link>
              </div>
            </div>

            {/* Mobile Layout - Stacked, Center Aligned */}
            <div className="md:hidden h-full flex flex-col justify-end pb-8 px-4">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {heroRaffle.title}
                </h1>
                <div className="text-white text-base">
                  <CountdownTimer endDate={heroRaffle.ends_at} />
                </div>
                <div className="pt-2">
                  <Link
                    href={`/raffles/${heroRaffle.id}`}
                    className="inline-flex items-center justify-center w-full max-w-sm bg-[#069852] text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-[#058a47] transition-colors"
                  >
                    Enter Now
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
