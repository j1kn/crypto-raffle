'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import { getWalletAddress, isWalletConnected, connectWallet } from '@/lib/wallet';
import { Trophy, Clock, Users, Play } from 'lucide-react';

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

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchRaffle();
      checkWallet();
    }
  }, [params.id]);

  useEffect(() => {
    if (raffle && walletAddress) {
      fetchEntryCount();
      fetchUserEntry();
    }
  }, [raffle, walletAddress]);

  const checkWallet = () => {
    if (isWalletConnected()) {
      setWalletAddress(getWalletAddress());
    }
  };

  const fetchRaffle = async () => {
    try {
      const { data, error } = await supabase
        .from('public_raffles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setRaffle(data);
    } catch (error) {
      console.error('Error fetching raffle:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntryCount = async () => {
    if (!raffle) return;
    try {
      const { count, error } = await supabase
        .from('raffle_entries')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', raffle.id);

      if (error) throw error;
      setEntryCount(count || 0);
    } catch (error) {
      console.error('Error fetching entry count:', error);
    }
  };

  const fetchUserEntry = async () => {
    if (!raffle || !walletAddress) return;
    try {
      // First get or create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
        .select()
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return;
      }

      // Set wallet context for RLS (this is a workaround - in production use proper auth)
      // For now, we'll try to fetch the entry
      const { data, error } = await supabase
        .from('raffle_entries')
        .select('*')
        .eq('raffle_id', raffle.id)
        .eq('user_id', userData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching entry:', error);
        return;
      }
      setUserEntry(data);
    } catch (error) {
      console.error('Error fetching user entry:', error);
    }
  };

  const handleEnterRaffle = async () => {
    if (!raffle) return;

    if (!isWalletConnected() || !walletAddress) {
      const address = await connectWallet();
      if (!address) {
        alert('Please connect your wallet to enter the raffle');
        return;
      }
      setWalletAddress(address);
      // Wait a bit for state to update, then try again
      setTimeout(() => {
        if (!userEntry) {
          handleEnterRaffle();
        }
      }, 500);
      return;
    }

    if (userEntry) {
      alert('You have already entered this raffle!');
      return;
    }

    setEntering(true);
    try {
      // Upsert user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
        .select()
        .single();

      if (userError) throw userError;

      // Create entry
      const { error: entryError } = await supabase
        .from('raffle_entries')
        .insert({
          raffle_id: raffle.id,
          user_id: userData.id,
        });

      if (entryError) {
        // Check if it's a duplicate entry error
        if (entryError.code === '23505') {
          alert('You have already entered this raffle!');
          fetchUserEntry();
        } else {
          throw entryError;
        }
      } else {
        alert('Successfully entered the raffle!');
        fetchEntryCount();
        fetchUserEntry();
      }
    } catch (error: any) {
      console.error('Error entering raffle:', error);
      alert(error.message || 'Failed to enter raffle');
    } finally {
      setEntering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Raffle not found
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-primary-dark">
        {/* Banner Image */}
        {raffle.image_url && (
          <div className="relative w-full h-64 md:h-96 bg-primary-darker">
            <Image
              src={raffle.image_url}
              alt={raffle.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent"></div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {raffle.title}
              </h1>
              
              {raffle.description && (
                <div className="prose prose-invert max-w-none mb-8">
                  <p className="text-gray-300 text-lg">{raffle.description}</p>
                </div>
              )}

              {/* Entry Count */}
              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Users className="w-5 h-5" />
                  <span>Total Entries</span>
                </div>
                <p className="text-3xl font-bold text-primary-green">
                  {entryCount} / {raffle.max_tickets}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 sticky top-4">
                {/* Prize Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span>Prize Pool</span>
                  </div>
                  <p className="text-3xl font-bold text-primary-green">
                    {raffle.prize_pool_symbol} {raffle.prize_pool_amount.toLocaleString()}
                  </p>
                </div>

                {/* Ticket Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span>Ticket Price</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {raffle.prize_pool_symbol} {raffle.ticket_price}
                  </p>
                </div>

                {/* Countdown */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span>Time Remaining</span>
                  </div>
                  <CountdownTimer endDate={raffle.ends_at} />
                </div>

                {/* Enter Button */}
                <button
                  onClick={handleEnterRaffle}
                  disabled={entering || userEntry !== null}
                  className={`w-full py-4 rounded font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                    userEntry
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-green text-primary-darker hover:bg-primary-green/90'
                  }`}
                >
                  {entering ? (
                    'Entering...'
                  ) : userEntry ? (
                    'Already Entered'
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      ENTER RAFFLE
                    </>
                  )}
                </button>

                {userEntry && (
                  <p className="text-sm text-gray-400 mt-4 text-center">
                    You entered this raffle
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

