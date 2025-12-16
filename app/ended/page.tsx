'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Trophy, Clock, Users, ExternalLink } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import Image from 'next/image';

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
  winner_user_id: string | null;
  winner_drawn_at: string | null;
}

export default function EndedRafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEndedRaffles();
  }, []);

  const fetchEndedRaffles = async () => {
    try {
      const now = new Date().toISOString();
      
      // Fetch raffles that have ended (ends_at < now) and are not draft
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .lt('ends_at', now)
        .neq('status', 'draft')
        .order('ends_at', { ascending: false });

      if (error) throw error;
      setRaffles(data || []);
    } catch (error) {
      console.error('Error fetching ended raffles:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading ended raffles...
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ENDED RAFFLES
            </h1>
            <Link
              href="/raffles"
              className="text-primary-green hover:text-primary-green/80 text-sm font-medium flex items-center gap-2"
            >
              View Active Raffles
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {raffles.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-primary-gray border border-primary-lightgray rounded-lg">
              <p className="text-lg mb-4">No ended raffles yet.</p>
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
              {raffles.map((raffle) => (
                <div
                  key={raffle.id}
                  className="bg-primary-gray border border-primary-lightgray rounded-lg overflow-hidden hover:border-primary-orange transition-all"
                >
                  {raffle.image_url && (
                    <div className="relative w-full h-48 bg-primary-darker">
                      <Image
                        src={convertGoogleDriveUrl(raffle.image_url) || raffle.image_url}
                        alt={raffle.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-white font-bold text-lg mb-2">
                      {raffle.title}
                    </h3>
                    {raffle.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {raffle.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-primary-green" />
                        <span className="text-gray-400">Prize:</span>
                        <span className="text-primary-green font-semibold">
                          {raffle.prize_pool_symbol} {raffle.prize_pool_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary-orange" />
                        <span className="text-gray-400">Ended:</span>
                        <span className="text-primary-orange">
                          {new Date(raffle.ends_at).toLocaleDateString()}
                        </span>
                      </div>
                      {raffle.winner_user_id && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-primary-green" />
                          <span className="text-gray-400">Winner:</span>
                          <span className="text-primary-green font-semibold">
                            Drawn
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/raffles/${raffle.id}`}
                        className="flex-1 bg-primary-green text-primary-darker py-2 rounded text-center font-semibold hover:bg-primary-green/90 transition-colors"
                      >
                        VIEW DETAILS
                      </Link>
                      {raffle.winner_user_id && (
                        <Link
                          href="/winners"
                          className="flex-1 bg-primary-orange text-white py-2 rounded text-center font-semibold hover:bg-primary-orange/90 transition-colors"
                        >
                          SEE WINNER
                        </Link>
                      )}
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

