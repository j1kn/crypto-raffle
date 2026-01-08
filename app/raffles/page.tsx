'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

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
  image_url_portrait: string | null;
  prize_pool_amount: number;
  prize_pool_symbol: string;
  ticket_price: number;
  max_tickets: number;
  status: string;
  ends_at: string;
  starts_at: string | null;
  is_featured?: boolean | null;
}

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .order('is_featured', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRaffles(data || []);
      
      // Fetch entry counts for all raffles
      if (data && data.length > 0) {
        fetchEntryCounts(data.map(r => r.id));
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading raffles...</div>
          ) : raffles.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              No active raffles at the moment. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ gridAutoRows: '1fr' }}>
              {raffles.map((raffle) => (
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
                  prizePlaces={Math.floor(raffle.max_tickets / 10)}
                  badgeColor={raffle.prize_pool_amount > 50000 ? 'orange' : 'green'}
                  entryCount={entryCounts[raffle.id] || 0}
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

