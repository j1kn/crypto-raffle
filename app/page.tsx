'use client';

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

export default function HomePage() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      // Fetch live raffles from public_raffles view
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(3); // Show only 3 raffles on home page

      if (error) {
        console.error('Error fetching raffles:', error);
      } else {
        setRaffles(data || []);
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-darker to-primary-dark py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            TOURNAMENT
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            HOME • TOURNAMENT
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/raffles"
              className="bg-primary-green text-primary-darker px-8 py-4 rounded font-bold text-lg hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              VIEW LIVE RAFFLES
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
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-dark to-transparent"></div>
      </section>

      {/* Play to Earn Games Section - Now Shows Live Raffles */}
      <section className="py-20 px-4 bg-primary-dark">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-green text-sm font-semibold mb-2">OUR TOURNAMENT</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              PLAY TO EARN GAMES
            </h2>
            <div className="w-24 h-1 bg-primary-green mx-auto"></div>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <Footer />
    </div>
  );
}

