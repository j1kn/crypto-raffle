'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Crown, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Winner {
  raffle_id: string;
  raffle_title: string;
  winner_wallet: string;
  drawn_at: string;
  prize_pool_amount: number;
  prize_pool_symbol: string;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      // Fetch all completed raffles with winners
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
        .order('winner_drawn_at', { ascending: false });

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

      setWinners(winnersList);
    } catch (error) {
      console.error('Error fetching winners:', error);
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-12 h-12 text-primary-orange" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                WINNERS
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Celebrating our raffle champions
            </p>
            <div className="w-24 h-1 bg-primary-green mx-auto mt-4"></div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">
              Loading winners...
            </div>
          ) : winners.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <Crown className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-xl mb-2">No winners yet</p>
              <p className="text-sm">Winners will appear here once raffles are completed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => (
                <div
                  key={winner.raffle_id}
                  className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 hover:border-primary-green transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 
                          ? 'bg-primary-orange text-white' 
                          : 'bg-primary-green/20 text-primary-green'
                      }`}>
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">#{index + 1}</p>
                        <p className="text-sm font-semibold text-white">Winner</p>
                      </div>
                    </div>
                    <Link
                      href={`/raffles/${winner.raffle_id}`}
                      className="text-primary-green hover:text-primary-green/80 text-sm"
                    >
                      View Raffle →
                    </Link>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
                    {winner.raffle_title}
                  </h3>

                  <div className="bg-primary-darker rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-xs mb-1">Winner Address</p>
                    <p className="text-primary-green font-mono text-sm break-all">
                      {winner.winner_wallet}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Prize Won</p>
                      <p className="text-primary-green font-bold text-lg">
                        {winner.prize_pool_symbol} {winner.prize_pool_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs mb-1">Drawn</p>
                      <div className="flex items-center gap-1 text-gray-300 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(winner.drawn_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

