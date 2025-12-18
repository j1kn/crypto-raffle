'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { parseEther } from 'viem';
import { Trophy, Clock, Users, Play, Crown, CheckCircle } from 'lucide-react';

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
  receiving_address?: string | null;
  winner_user_id?: string | null;
  winner_drawn_at?: string | null;
}

interface Entry {
  id: string;
  user_id: string;
  created_at: string;
  users: {
    wallet_address: string;
  };
}

interface Winner {
  wallet_address: string;
  drawn_at: string;
}

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { open } = useWeb3Modal();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const { address, isConnected, chain, connector } = useAccount();
  
  // Payment transaction
  const { data: hash, sendTransaction, isPending: isSending, error: sendError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug wallet connection
  useEffect(() => {
    console.log('Wallet Connection Debug:', {
      address,
      isConnected,
      chain: chain?.name,
      connector: connector?.name,
    });
  }, [address, isConnected, chain, connector]);

  useEffect(() => {
    if (params.id) {
      fetchRaffle();
    }
  }, [params.id]);

  useEffect(() => {
    if (raffle) {
      fetchEntryCount();
      fetchEntries();
      if (raffle.winner_user_id) {
        fetchWinner();
      }
      if (address) {
        fetchUserEntry();
      }
      // Check if raffle ended and draw winner if needed
      checkAndDrawWinner();
    }
  }, [raffle, address]);

  // Auto-refresh entries every 5 seconds for live updates
  useEffect(() => {
    if (!raffle) return;
    const interval = setInterval(() => {
      fetchEntryCount();
      fetchEntries();
    }, 5000);
    return () => clearInterval(interval);
  }, [raffle]);

  const fetchRaffle = async () => {
    try {
      // For payment, we need receiving_address, so fetch from raffles table directly
      // This requires RLS to allow reading raffles (which should be allowed for public)
      const { data, error } = await supabase
        .from('raffles')
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

  const fetchEntries = async () => {
    if (!raffle) return;
    try {
      const { data, error } = await supabase
        .from('raffle_entries')
        .select(`
          id,
          user_id,
          created_at,
          users!inner (
            wallet_address
          )
        `)
        .eq('raffle_id', raffle.id)
        .order('created_at', { ascending: false })
        .limit(50); // Show last 50 entries

      if (error) throw error;
      setEntries((data as any) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchWinner = async () => {
    if (!raffle || !raffle.winner_user_id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', raffle.winner_user_id)
        .single();

      if (error) throw error;
      setWinner({
        wallet_address: data.wallet_address,
        drawn_at: raffle.winner_drawn_at || '',
      });
    } catch (error) {
      console.error('Error fetching winner:', error);
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

  const fetchUserEntry = async () => {
    if (!raffle || !address) return;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ wallet_address: address }, { onConflict: 'wallet_address' })
        .select()
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return;
      }

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

  const checkAndDrawWinner = async () => {
    if (!raffle) return;
    
    const now = new Date();
    const endsAt = new Date(raffle.ends_at);
    
    // Check if raffle has ended and winner not drawn
    if (endsAt <= now && !raffle.winner_user_id && raffle.status === 'live') {
      try {
        const response = await fetch(`/api/raffles/${raffle.id}/draw-winner`, {
          method: 'POST',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Refresh raffle data to show winner
            fetchRaffle();
            fetchWinner();
          }
        }
      } catch (error) {
        console.error('Error drawing winner:', error);
      }
    }
  };

  const handleEnterRaffle = async () => {
    if (!raffle) return;

    // Enhanced wallet connection check
    if (!address) {
      const connect = confirm('Please connect your wallet to enter the raffle.\n\nClick OK to open wallet connection.');
      if (connect) {
        open();
      }
      return;
    }

    if (userEntry) {
      alert('You have already entered this raffle! Check your dashboard to see your ticket.');
      return;
    }

    // Check if raffle has ended
    const now = new Date();
    const endsAt = new Date(raffle.ends_at);
    if (endsAt <= now) {
      alert('This raffle has ended! Check the Ended Raffles page.');
      router.push('/ended');
      return;
    }

    // Check if raffle is full
    if (entryCount >= raffle.max_tickets) {
      alert('This raffle is full! All tickets have been sold.');
      return;
    }

    // Check if receiving address is set
    if (!raffle.receiving_address) {
      alert('Raffle receiving address not configured. Please contact support.');
      return;
    }

    // Enforce correct network for ETH raffles
    // If the raffle prize is in ETH, user must be on Ethereum mainnet (chain id 1)
    if (raffle.prize_pool_symbol?.toUpperCase() === 'ETH') {
      if (!chain || chain.id !== 1) {
        alert(
          'This raffle is on Ethereum.\n\n' +
          'Please switch your wallet network to Ethereum Mainnet before entering.'
        );
        return;
      }
    }

    // Confirm purchase
    const confirmPurchase = confirm(
      `Enter Raffle: ${raffle.title}\n\n` +
      `Entry Price: ${raffle.prize_pool_symbol} ${raffle.ticket_price}\n` +
      `Prize Pool: ${raffle.prize_pool_symbol} ${raffle.prize_pool_amount.toLocaleString()}\n\n` +
      `Click OK to proceed with payment.`
    );

    if (!confirmPurchase) {
      return;
    }

    setEntering(true);
    
    try {
      // Convert ticket price to wei (assuming ETH/ETH-based chains)
      const ticketPriceWei = parseEther(raffle.ticket_price.toString());
      
      // Send payment transaction
      sendTransaction({
        to: raffle.receiving_address as `0x${string}`,
        value: ticketPriceWei,
      });
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
      setEntering(false);
    }
  };

  // Handle successful payment confirmation
  useEffect(() => {
    if (isConfirmed && hash && raffle && address) {
      handlePaymentSuccess();
    }
  }, [isConfirmed, hash, raffle, address]);

  // Handle payment errors
  useEffect(() => {
    if (sendError) {
      console.error('Payment error:', sendError);
      alert(sendError.message || 'Payment failed. Please try again.');
      setEntering(false);
    }
  }, [sendError]);

  const handlePaymentSuccess = async () => {
    if (!raffle || !address || !hash) return;

    try {
      // Create/update user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ wallet_address: address }, { onConflict: 'wallet_address' })
        .select()
        .single();

      if (userError) throw userError;

      // Create raffle entry with transaction hash
      const { data: entryData, error: entryError } = await supabase
        .from('raffle_entries')
        .insert({
          raffle_id: raffle.id,
          user_id: userData.id,
          tx_hash: hash, // Save transaction hash
        })
        .select()
        .single();

      if (entryError) {
        if (entryError.code === '23505') {
          // User already entered - update with tx hash
          const { error: updateError } = await supabase
            .from('raffle_entries')
            .update({ tx_hash: hash })
            .eq('raffle_id', raffle.id)
            .eq('user_id', userData.id);
          
          if (updateError) {
            console.error('Error updating entry:', updateError);
          }
          alert('You have already entered this raffle! Transaction hash updated.');
          fetchUserEntry();
        } else {
          throw entryError;
        }
      } else {
        alert('Payment successful! You have entered the raffle. Your ticket is now in your profile.');
        fetchEntryCount();
        fetchEntries();
        fetchUserEntry();
      }
    } catch (error: any) {
      console.error('Error creating entry after payment:', error);
      alert('Payment successful but failed to create entry. Please contact support with your transaction hash: ' + hash);
    } finally {
      setEntering(false);
    }
  };

  const isRaffleEnded = raffle ? new Date(raffle.ends_at) <= new Date() : false;

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
              src={convertGoogleDriveUrl(raffle.image_url) || raffle.image_url}
              alt={raffle.title}
              fill
              className="object-cover"
              unoptimized
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
                  <p className="text-gray-300 text-lg whitespace-pre-line">{raffle.description}</p>
                </div>
              )}

              {/* Winner Section */}
              {winner && (
                <div className="bg-gradient-to-r from-primary-orange/20 to-primary-green/20 border-2 border-primary-orange rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-primary-orange" />
                    <h2 className="text-2xl font-bold text-white">WINNER ANNOUNCED!</h2>
                  </div>
                  <div className="bg-primary-darker rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Winner Wallet Address:</p>
                    <p className="text-primary-green font-mono text-lg font-bold">
                      {winner.wallet_address}
                    </p>
                    {winner.drawn_at && (
                      <p className="text-gray-400 text-sm mt-2">
                        Drawn on: {new Date(winner.drawn_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Entry Count */}
              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>Total Entries</span>
                  </div>
                  {!isRaffleEnded && (
                    <span className="text-xs text-primary-green animate-pulse">LIVE</span>
                  )}
                </div>
                <p className="text-3xl font-bold text-primary-green">
                  {entryCount} / {raffle.max_tickets}
                </p>
              </div>

              {/* Live Entries Section */}
              {entries.length > 0 && (
                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Users className="w-5 h-5" />
                    <h2 className="text-xl font-semibold text-white">Live Entries</h2>
                    {!isRaffleEnded && (
                      <span className="text-xs text-primary-green bg-primary-green/20 px-2 py-1 rounded">
                        UPDATING
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-primary-darker rounded-lg p-3 hover:bg-primary-dark transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-primary-green" />
                          </div>
                          <div>
                            <p className="text-white font-mono text-sm">
                              {entry.users.wallet_address.slice(0, 6)}...{entry.users.wallet_address.slice(-4)}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(entry.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {entry.users.wallet_address.toLowerCase() === address?.toLowerCase() && (
                          <span className="text-xs bg-primary-green/20 text-primary-green px-2 py-1 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {entries.length >= 50 && (
                    <p className="text-gray-400 text-sm mt-4 text-center">
                      Showing last 50 entries
                    </p>
                  )}
                </div>
              )}
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

                {/* Entry Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span>Entry Price</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {raffle.prize_pool_symbol} {raffle.ticket_price}
                  </p>
                </div>

                {/* Countdown Timer */}
                {!isRaffleEnded ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span>Time Remaining</span>
                    </div>
                    <CountdownTimer endDate={raffle.ends_at} />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span>Status</span>
                    </div>
                    <p className="text-xl font-bold text-primary-orange">
                      RAFFLE ENDED
                    </p>
                  </div>
                )}

                {/* Enter Button */}
                {!isRaffleEnded && (
                  <button
                    onClick={handleEnterRaffle}
                    disabled={entering || userEntry !== null || isSending || isConfirming}
                    className={`w-full py-4 rounded font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                      userEntry || isSending || isConfirming
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-green text-primary-darker hover:bg-primary-green/90'
                    }`}
                  >
                    {isSending ? (
                      'Confirming Payment...'
                    ) : isConfirming ? (
                      'Processing Entry...'
                    ) : entering ? (
                      'Entering...'
                    ) : userEntry ? (
                      'Already Entered'
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        ENTER NOW - {raffle.prize_pool_symbol} {raffle.ticket_price}
                      </>
                    )}
                  </button>
                )}

                {userEntry && (
                  <div className="mt-4 p-3 bg-primary-green/20 border border-primary-green rounded-lg">
                    <p className="text-sm text-primary-green text-center font-semibold">
                      ✓ You have entered this raffle!
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      Check your profile to see your ticket
                    </p>
                  </div>
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
