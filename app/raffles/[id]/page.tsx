'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useRef, useMemo, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import {
  useAccount,
  useChainId,
  useConfig,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { parseEther } from 'viem';
import { Trophy, Clock, Users, Play, Crown, CheckCircle } from 'lucide-react';

// Client-side check to prevent SSR issues
const isClient = typeof window !== 'undefined';

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
  // Debug logging at the very start
  console.log('[Debug] Component rendering, hooks order check');

  // ALL HOOKS MUST BE AT TOP LEVEL - NO CONDITIONALS
  const params = useParams();
  const router = useRouter();
  
  // State hooks - always called
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [processingEntry, setProcessingEntry] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Wagmi hooks - ALWAYS called (not conditional)
  const { open } = useWeb3Modal();
  const { address, isConnected, chain, connector } = useAccount();
  const connectedChainId = useChainId();
  const config = useConfig();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  // Refs - always called
  const fetchingUserEntryRef = useRef(false);
  const processingEntryRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Mount tracking - CRITICAL for preventing state updates after unmount
  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      setMounted(false);
      isMountedRef.current = false;
    };
  }, []);

  // Safe state setter with mount check
  const safeSetState = useCallback(<T,>(setter: (value: T) => void, value: T) => {
    if (mounted && isMountedRef.current) {
      setter(value);
    }
  }, [mounted]);

  // Safe navigation function
  const handleNavigation = useCallback((path: string) => {
    try {
      if (mounted && isMountedRef.current) {
        router.push(path);
      }
    } catch (error) {
      console.error('[Navigation] Error:', error);
    }
  }, [mounted, router]);

  // Fetch raffle with mount checks
  const fetchRaffle = useCallback(async () => {
    const raffleId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
    if (!raffleId) {
      console.error('[Raffle] No raffle ID found in params:', params);
      if (mounted) setLoading(false);
      return;
    }
    
    let cancelled = false;
    
    try {
      console.log('[Raffle] Fetching raffle with ID:', raffleId);
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();

      if (cancelled || !mounted || !isMountedRef.current) return;

      if (error) {
        console.error('[Raffle] Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('[Raffle] No data returned for ID:', raffleId);
        if (mounted) {
          setRaffle(null);
          setLoading(false);
        }
        return;
      }
      
      console.log('[Raffle] Successfully fetched raffle:', data.title);
      if (mounted && !cancelled) {
        setRaffle(data);
        setLoading(false);
      }
    } catch (error: any) {
      if (cancelled || !mounted || !isMountedRef.current) return;
      console.error('[Raffle] Error fetching raffle:', error?.message || error);
      setRaffle(null);
      setLoading(false);
    }
    
    return () => {
      cancelled = true;
    };
  }, [params.id, mounted]);

  // Fetch entry count with mount checks
  const fetchEntryCount = useCallback(async () => {
    if (!raffle?.id || !mounted) return;
    
    let cancelled = false;
    
    try {
      const { count, error } = await supabase
        .from('raffle_entries')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', raffle.id);

      if (cancelled || !mounted || !isMountedRef.current) return;

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('401')) {
          return;
        }
        throw error;
      }
      
      if (mounted && !cancelled) {
        setEntryCount(count || 0);
      }
    } catch (error: any) {
      if (cancelled || !mounted) return;
      console.warn('[Entry Count] Error:', error?.message);
    }
    
    return () => {
      cancelled = true;
    };
  }, [raffle?.id, mounted]);

  // Fetch entries with mount checks
  const fetchEntries = useCallback(async () => {
    if (!raffle?.id || !mounted) return;
    
    let cancelled = false;
    
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
        .limit(50);

      if (cancelled || !mounted || !isMountedRef.current) return;

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('401')) {
          if (mounted && !cancelled) {
            setEntries([]);
          }
          return;
        }
        throw error;
      }
      
      if (mounted && !cancelled) {
        setEntries((data as any) || []);
      }
    } catch (error: any) {
      if (cancelled || !mounted) return;
      console.warn('[Entries] Error:', error?.message);
      if (mounted) {
        setEntries([]);
      }
    }
    
    return () => {
      cancelled = true;
    };
  }, [raffle?.id, mounted]);

  // Fetch winner with mount checks
  const fetchWinner = useCallback(async () => {
    if (!raffle?.winner_user_id || !mounted) return;
    
    let cancelled = false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', raffle.winner_user_id)
        .single();

      if (cancelled || !mounted || !isMountedRef.current) return;

      if (error) throw error;
      
      if (mounted && !cancelled) {
        setWinner({
          wallet_address: data.wallet_address,
          drawn_at: raffle.winner_drawn_at || '',
        });
      }
    } catch (error) {
      if (cancelled || !mounted) return;
      console.warn('[Winner] Error:', error);
    }
    
    return () => {
      cancelled = true;
    };
  }, [raffle?.winner_user_id, raffle?.winner_drawn_at, mounted]);

  // Convert Google Drive URL
  const convertGoogleDriveUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
      const altMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (altMatch) {
        return `https://drive.google.com/uc?export=view&id=${altMatch[1]}`;
      }
    }
    
    return url;
  };

  // Memoize converted image URL
  const convertedImageUrl = useMemo(() => {
    return raffle?.image_url ? convertGoogleDriveUrl(raffle.image_url) || raffle.image_url : null;
  }, [raffle?.image_url]);

  // Fetch user entry with mount checks
  const fetchUserEntry = useCallback(async () => {
    if (!raffle || !address || fetchingUserEntryRef.current || !mounted) return;
    fetchingUserEntryRef.current = true;
    
    let cancelled = false;
    
    try {
      const response = await fetch(`/api/users/get-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (cancelled || !mounted || !isMountedRef.current) return;

      if (!response.ok) {
        console.warn('[User Entry] API call failed, skipping entry check');
        return;
      }

      const { userId } = await response.json();
      if (!userId || cancelled || !mounted) return;

      const entryResponse = await fetch(`/api/raffles/${raffle.id}/check-entry?userId=${userId}`);
      if (entryResponse.ok && !cancelled && mounted) {
        const entryData = await entryResponse.json();
        if (entryData.entry && mounted && !cancelled) {
          setUserEntry(entryData.entry);
        }
      }
    } catch (error: any) {
      if (cancelled || !mounted) return;
      console.warn('[User Entry] Error:', error?.message || 'Unknown error');
    } finally {
      fetchingUserEntryRef.current = false;
    }
    
    return () => {
      cancelled = true;
    };
  }, [raffle?.id, address, mounted]);

  // Check and draw winner
  const checkAndDrawWinner = useCallback(async () => {
    if (!raffle?.id || !mounted) return;
    
    const now = new Date();
    const endsAt = new Date(raffle.ends_at);
    
    if (endsAt <= now && !raffle.winner_user_id && raffle.status === 'live') {
      try {
        const response = await fetch(`/api/raffles/${raffle.id}/draw-winner`, {
          method: 'POST',
        });
        
        if (response.ok && mounted) {
          const data = await response.json();
          if (data.success && mounted) {
            setTimeout(() => {
              if (mounted && isMountedRef.current) {
                fetchRaffle();
                fetchWinner();
              }
            }, 100);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.warn('[Draw Winner] Error:', error);
      }
    }
  }, [raffle?.id, raffle?.ends_at, raffle?.winner_user_id, raffle?.status, fetchRaffle, fetchWinner, mounted]);

  // Effect: Fetch raffle on mount
  useEffect(() => {
    if (!mounted || !isClient) return;
    
    let cancelled = false;
    const raffleId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
    
    if (raffleId) {
      fetchRaffle();
    }
    
    return () => {
      cancelled = true;
    };
  }, [mounted, params.id, fetchRaffle]);

  // Effect: Fetch entry count and entries when raffle loads
  useEffect(() => {
    if (!raffle?.id || !mounted) return;
    
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled && mounted && isMountedRef.current) {
        fetchEntryCount();
        fetchEntries();
      }
    }, 0);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [raffle?.id, fetchEntryCount, fetchEntries, mounted]);

  // Effect: Fetch winner when winner_user_id exists
  useEffect(() => {
    if (!raffle?.winner_user_id || !mounted) return;
    
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled && mounted && isMountedRef.current) {
        fetchWinner();
      }
    }, 0);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [raffle?.winner_user_id, fetchWinner, mounted]);

  // Effect: Check and draw winner
  useEffect(() => {
    if (!raffle?.id || !mounted) return;
    
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled && mounted && isMountedRef.current) {
        checkAndDrawWinner();
      }
    }, 0);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [raffle?.id, raffle?.ends_at, checkAndDrawWinner, mounted]);

  // Effect: Fetch user entry when address changes
  useEffect(() => {
    if (!raffle?.id || !address || !mounted) return;
    
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled && mounted && isMountedRef.current) {
        fetchUserEntry();
      }
    }, 0);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [raffle?.id, address, fetchUserEntry, mounted]);

  // Effect: Auto-refresh entries every 5 seconds
  useEffect(() => {
    if (!raffle?.id || !mounted) return;
    
    let cancelled = false;
    const interval = setInterval(() => {
      if (!cancelled && mounted && isMountedRef.current) {
        setTimeout(() => {
          if (!cancelled && mounted && isMountedRef.current) {
            fetchEntryCount();
            fetchEntries();
          }
        }, 0);
      }
    }, 5000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [raffle?.id, fetchEntryCount, fetchEntries, mounted]);

  const REQUIRED_CHAIN_ID = 1;
  const PAYOUT_ADDRESS = '0x842bab27dE95e329eb17733c1f29c082e5dd94c3' as `0x${string}`;

  // Handle enter raffle
  const handleEnterRaffle = async () => {
    if (!raffle || !mounted) return;

    if (!address) {
      const connect = confirm(
        'Please connect your wallet to enter the raffle.\n\nClick OK to open wallet connection.'
      );
      if (connect && mounted) {
        open();
      }
      return;
    }

    if (!isConnected) {
      alert('Wallet is not fully connected. Please reconnect your wallet and try again.');
      return;
    }

    if (userEntry) {
      alert('You have already entered this raffle! Check your dashboard to see your ticket.');
      return;
    }

    const now = new Date();
    const endsAt = new Date(raffle.ends_at);
    if (endsAt <= now) {
      alert('This raffle has ended! Check the Ended Raffles page.');
      if (mounted) {
        handleNavigation('/ended');
      }
      return;
    }

    if (entryCount >= raffle.max_tickets) {
      alert('This raffle is full! All tickets have been sold.');
      return;
    }

    let currentChainId: number | undefined = connectedChainId ?? chain?.id;
    
    if (!currentChainId && connector) {
      try {
        const provider = await connector.getProvider();
        if (provider && typeof provider === 'object' && provider !== null && 'chainId' in provider) {
          const chainIdValue = (provider as { chainId?: string | number }).chainId;
          if (chainIdValue !== undefined) {
            const providerChainId = typeof chainIdValue === 'string' 
              ? parseInt(chainIdValue, 16) 
              : chainIdValue;
            if (typeof providerChainId === 'number') {
              currentChainId = providerChainId;
            }
          }
        }
      } catch (e) {
        console.warn('[Payment] Could not get chainId from connector:', e);
      }
    }
    
    if (!currentChainId) {
      alert(
        'Unable to detect your current network. Please reconnect your wallet and ensure you are on Ethereum Mainnet.'
      );
      return;
    }

    if (raffle.prize_pool_symbol?.toUpperCase() === 'ETH') {
      if (currentChainId !== REQUIRED_CHAIN_ID) {
        try {
          console.log(`[Payment] Current chain: ${currentChainId}, required: ${REQUIRED_CHAIN_ID}`);
          await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
          
          let verifiedChainId: number | undefined = undefined;
          const maxAttempts = 10;
          const pollInterval = 500;
          
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            
            verifiedChainId = connectedChainId ?? chain?.id;
            
            if (!verifiedChainId && connector) {
              try {
                const provider = await connector.getProvider();
                if (provider && typeof provider === 'object' && provider !== null && 'chainId' in provider) {
                  const chainIdValue = (provider as { chainId?: string | number }).chainId;
                  if (chainIdValue !== undefined) {
                    const providerChainId = typeof chainIdValue === 'string' 
                      ? parseInt(chainIdValue, 16) 
                      : chainIdValue;
                    if (typeof providerChainId === 'number') {
                      verifiedChainId = providerChainId;
                    }
                  }
                }
              } catch (e) {
                // Ignore
              }
            }
            
            if (verifiedChainId === REQUIRED_CHAIN_ID) {
              console.log(`[Payment] Chain verified as ${REQUIRED_CHAIN_ID}`);
              break;
            }
          }
          
          if (verifiedChainId !== REQUIRED_CHAIN_ID) {
            throw new Error(
              `Failed to switch to Ethereum Mainnet. Current chain: ${verifiedChainId || 'undefined'}.`
            );
          }
          
          currentChainId = verifiedChainId;
        } catch (error: any) {
          console.error('[Payment] Network switch error:', error);
          alert(
            `${error?.message || 'Failed to switch network'}\n\nPlease switch your wallet to Ethereum Mainnet (chainId: 1) and try again.`
          );
          if (mounted) {
            setEntering(false);
          }
          return;
        }
      }
    }

    let finalChainId = connectedChainId ?? chain?.id ?? currentChainId;
    
    if (!finalChainId) {
      alert(
        'Unable to verify network. Please reconnect your wallet and ensure you are on Ethereum Mainnet.'
      );
      if (mounted) setEntering(false);
      return;
    }
    
    if (finalChainId !== REQUIRED_CHAIN_ID) {
      alert(
        `This raffle requires Ethereum Mainnet (chainId: 1).\n\nYour current network: chainId ${finalChainId}\n\nPlease switch to Ethereum Mainnet and try again.`
      );
      if (mounted) setEntering(false);
      return;
    }

    const confirmPurchase = confirm(
      `Enter Raffle: ${raffle.title}\n\n` +
        `Entry Price: ${raffle.prize_pool_symbol} ${raffle.ticket_price}\n` +
        `Prize Pool: ${raffle.prize_pool_symbol} ${raffle.prize_pool_amount.toLocaleString()}\n` +
        `Network: Ethereum Mainnet (chainId: 1)\n\n` +
        `Click OK to proceed with payment.`
    );

    if (!confirmPurchase) {
      return;
    }

    if (mounted) setEntering(true);

    try {
      if (!address) {
        throw new Error('Missing sender address. Please reconnect your wallet.');
      }
      
      const lastChainCheck = connectedChainId ?? chain?.id;
      if (!lastChainCheck || lastChainCheck !== REQUIRED_CHAIN_ID) {
        throw new Error(
          `Chain verification failed. Expected chainId: ${REQUIRED_CHAIN_ID}, got: ${lastChainCheck || 'undefined'}.`
        );
      }
      
      if (!PAYOUT_ADDRESS) {
        throw new Error('Missing recipient address. Please contact support.');
      }

      const value = parseEther(raffle.ticket_price.toString());
      
      console.log('[Payment] Preparing plain ETH transfer:', {
        from: address,
        to: PAYOUT_ADDRESS,
        value: value.toString(),
        valueInEth: raffle.ticket_price.toString(),
        chainId: REQUIRED_CHAIN_ID,
      });

      console.log('[Payment] Sending plain ETH transfer:', {
        to: PAYOUT_ADDRESS,
        value: value.toString(),
        chainId: REQUIRED_CHAIN_ID,
      });

      const hash = await sendTransactionAsync({
        to: PAYOUT_ADDRESS,
        value: value,
        chainId: REQUIRED_CHAIN_ID,
      });

      console.log('[Payment] Transaction sent successfully:', hash);
      if (hash && mounted) {
        setTxHash(hash);
      } else {
        throw new Error('Transaction hash not returned');
      }
    } catch (error: any) {
      if (!mounted) return;
      
      console.error('[Payment] Transaction error:', error);

      const message: string =
        error?.shortMessage ||
        error?.message ||
        (error?.cause && error.cause.message) ||
        '';

      const lower = message.toLowerCase();

      if (lower.includes('user rejected') || lower.includes('user denied')) {
        alert('Transaction was rejected in your wallet.');
      } else if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) {
        alert(
          'Insufficient funds to pay the entry price. Please top up your wallet and try again.'
        );
      } else if (
        lower.includes('chain') &&
        (lower.includes('mismatch') || lower.includes('unsupported') || lower.includes('invalid'))
      ) {
        alert(
          'Network mismatch detected. Please ensure your wallet is on Ethereum Mainnet (chainId: 1) and try again.'
        );
      } else if (lower.includes('internal error') || lower.includes('data couldn\'t be read')) {
        alert(
          'Wallet connection error. Please:\n\n1. Ensure you are on Ethereum Mainnet\n2. Disconnect and reconnect your wallet\n3. Try again'
        );
      } else {
        const userMessage = message || 'Failed to initiate payment. Please check your wallet connection and try again.';
        if (mounted) {
          setError(userMessage);
          setEntering(false);
          setTxHash(undefined);
        }
        setTimeout(() => alert(userMessage), 0);
      }
    }
  };

  // Handle payment success - with proper cleanup
  useEffect(() => {
    let isActive = true;
    
    const handleSuccess = async () => {
      if (!isConfirmed || !txHash || !raffle || !address || !isActive || !mounted) return;
      if (processingEntryRef.current) return;
      
      processingEntryRef.current = true;
      
      if (mounted && isActive) {
        setProcessingEntry(true);
        setError(null);
      }

      try {
        const response = await fetch(`/api/raffles/${raffle.id}/enter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, txHash }),
        });

        if (!isActive || !mounted) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to create entry`);
        }

        const data = await response.json();

        if (!isActive || !mounted) return;

        if (!data.success) {
          throw new Error(data.error || 'Failed to create raffle entry');
        }

        if (data.duplicate) {
          alert('You have already entered this raffle! Transaction hash updated.');
        } else {
          alert('Payment successful! You have entered the raffle. Your ticket is now in your profile.');
        }

        if (mounted && isActive) {
          startTransition(() => {
            if (mounted && isActive) {
              setTimeout(() => {
                if (mounted && isActive) {
                  fetchEntryCount();
                  fetchEntries();
                  fetchUserEntry();
                }
              }, 100);
            }
          });
        }
        
      } catch (error: any) {
        if (!isActive || !mounted) return;
        
        const errorMsg = error?.message || 'Unknown error';
        console.warn('[Payment Success] Entry creation failed:', errorMsg);
        
        alert(
          `Payment successful! However, there was an issue saving your entry.\n\n` +
          `Transaction Hash: ${txHash}\n\n` +
          `Please contact support with this transaction hash to verify your entry.`
        );
        
        if (mounted && isActive) {
          setError(`Entry creation failed: ${errorMsg}`);
        }
      } finally {
        processingEntryRef.current = false;
        if (mounted && isActive) {
          setProcessingEntry(false);
          setEntering(false);
        }
      }
    };

    if (isConfirmed && txHash && raffle?.id && address && mounted) {
      handleSuccess();
    }

    return () => {
      isActive = false;
    };
  }, [isConfirmed, txHash, raffle?.id, address, mounted]);

  // Handle payment errors
  useEffect(() => {
    let isActive = true;
    
    if (txError && !processingEntryRef.current && mounted) {
      const errorMessage = txError.message || 'Payment failed. Please try again.';
      const timeoutId = setTimeout(() => {
        if (isActive && mounted && isMountedRef.current) {
          queueMicrotask(() => {
            if (isActive && mounted && isMountedRef.current) {
              startTransition(() => {
                if (isActive && mounted && isMountedRef.current) {
                  setError(errorMessage);
                  setEntering(false);
                  setTxHash(undefined);
                }
              });
            }
          });
          setTimeout(() => {
            if (isActive && mounted) {
              alert(errorMessage);
            }
          }, 10);
        }
      }, 0);
      
      return () => {
        isActive = false;
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      isActive = false;
    };
  }, [txError, mounted]);

  // Memoize derived values
  const isRaffleEnded = useMemo(() => {
    if (!raffle?.ends_at) return false;
    return new Date(raffle.ends_at) <= new Date();
  }, [raffle?.ends_at]);

  // Render
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
            <p>Loading raffle...</p>
          </div>
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
          <div className="text-center">
            <p className="text-xl mb-4">Raffle not found</p>
            <button
              onClick={() => handleNavigation('/raffles')}
              className="text-primary-green hover:underline"
            >
              Browse all raffles
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-primary-dark">
        {raffle.image_url && (
          <div className="relative w-full h-64 md:h-96 bg-primary-darker">
            <Image
              src={convertedImageUrl || raffle.image_url}
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
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {raffle.title}
              </h1>
              
              {raffle.description && (
                <div className="prose prose-invert max-w-none mb-8">
                  <p className="text-gray-300 text-lg whitespace-pre-line">{raffle.description}</p>
                </div>
              )}

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

            <div className="lg:col-span-1">
              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 sticky top-4">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span>Prize Pool</span>
                  </div>
                  <p className="text-3xl font-bold text-primary-green">
                    {raffle.prize_pool_symbol} {raffle.prize_pool_amount.toLocaleString()}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span>Entry Price</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {raffle.prize_pool_symbol} {raffle.ticket_price}
                  </p>
                </div>

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

                {!isRaffleEnded && (
                  <button
                    onClick={handleEnterRaffle}
                    disabled={entering || userEntry !== null || isConfirming}
                    className={`w-full py-4 rounded font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                      userEntry || isConfirming
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-green text-primary-darker hover:bg-primary-green/90'
                    }`}
                  >
                    {isConfirmed && txHash ? (
                      'Success!'
                    ) : isConfirming ? (
                      'Processing Transaction...'
                    ) : entering ? (
                      'Confirm in Wallet...'
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

                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400 text-center font-semibold">
                      ⚠️ {error}
                    </p>
                    <button
                      onClick={() => mounted && setError(null)}
                      className="text-xs text-red-300 hover:text-red-200 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  </div>
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
