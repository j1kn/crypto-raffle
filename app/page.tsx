'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InfoBanner from '@/components/InfoBanner';
import HeroBanner from '@/components/HeroBanner';
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
  image_url_portrait: string | null;
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
      // Fetch the featured live raffle as hero (marked with is_featured = true)
      // Only shows live raffles that are explicitly marked as featured
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .eq('status', 'live')  // Only live raffles
        .eq('is_featured', true)  // Only featured raffles
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
      <HeroBanner />
      <InfoBanner />
      
      {/* Hero Raffle Section */}
      {heroRaffle && (
        <section className="relative w-screen overflow-hidden">
          {/* Mobile Layout - Full Screen with Background Image */}
          <div className="md:hidden relative h-[85vh] overflow-hidden">
            {/* Background Image */}
            {heroRaffle.image_url || heroRaffle.image_url_portrait ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={convertGoogleDriveUrl(
                    (heroRaffle.image_url_portrait || heroRaffle.image_url) || ''
                  ) || (heroRaffle.image_url_portrait || heroRaffle.image_url) || ''}
                  alt={heroRaffle.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[#0a0a0a]"></div>
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `linear-gradient(
                  to top,
                  rgba(0,0,0,0.85) 0%,
                  rgba(0,0,0,0.85) 20%,
                  rgba(0,0,0,0.6) 45%,
                  rgba(0,0,0,0.25) 65%,
                  rgba(0,0,0,0.0) 100%
                )`
              }}
            ></div>

            {/* Content - Stacked, Center Aligned */}
            <div className="relative z-10 h-full flex flex-col justify-end pb-8 px-4">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {heroRaffle.title}
                </h1>
                <div className="text-white text-base flex justify-center">
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

          {/* Desktop Layout - Split: Image Left, Details Right */}
          <div className="hidden md:flex min-h-[600px] bg-[#0a0a0a]">
            {/* Left Side - Image (50%) */}
            <div className="w-1/2 relative overflow-hidden">
              {heroRaffle.image_url ? (
                <img
                  src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                  alt={heroRaffle.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#069852] to-[#045a31]"></div>
              )}
            </div>

            {/* Right Side - Details (50%) */}
            <div className="w-1/2 flex flex-col justify-center px-12 lg:px-16 py-12">
              {/* Timer at Top */}
              <div className="mb-6">
                <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Time Remaining</div>
                <div className="text-white text-xl">
                  <CountdownTimer endDate={heroRaffle.ends_at} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
                {heroRaffle.title}
              </h1>

              {/* Prize Info */}
              <div className="mb-8 space-y-3">
                <div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Prize Pool</div>
                  <div className="text-[#069852] text-3xl font-bold">
                    {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Entry Price</div>
                  <div className="text-white text-xl font-semibold">
                    {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                  </div>
                </div>
              </div>

              {/* Enter Button */}
              <div>
                <Link
                  href={`/raffles/${heroRaffle.id}`}
                  className="inline-flex items-center justify-center bg-[#069852] text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#058a47] transition-colors shadow-lg hover:shadow-xl"
                >
                  Enter Now
                </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12" style={{ gridAutoRows: '1fr' }}>
              {raffles.map((raffle, index) => {
                const badgeColor = index === 1 ? 'orange' : 'green';
                return (
                  <RaffleCard
                    key={raffle.id}
                    id={raffle.id}
                    title={raffle.title}
                    imageUrl={raffle.image_url || undefined}
                    imageUrlPortrait={raffle.image_url_portrait || undefined}
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
