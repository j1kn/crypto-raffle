'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RaffleCard from '@/components/RaffleCard';
import { supabase } from '@/lib/supabase';

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

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRaffles(data || []);
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-green text-sm font-semibold mb-2">TOURNAMENT LIST</p>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                ACTIVE TOURNAMENT
              </h1>
              <button className="text-white text-sm hover:text-primary-green transition-colors">
                EXPLORE MORE →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading raffles...</div>
          ) : raffles.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              No active raffles at the moment. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => (
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
                  prizePlaces={Math.floor(raffle.max_tickets / 10)}
                  badgeColor={raffle.prize_pool_amount > 50000 ? 'orange' : 'green'}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

