'use client';

// Force dynamic rendering to avoid SSR issues with Wagmi
export const dynamic = 'force-dynamic';

import { useEffect, useLayoutEffect, useState, useCallback, useRef, useMemo, startTransition } from 'react';
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
  usePublicClient,
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
  const params = useParams();
  const router = useRouter();
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
  
  // Only use Wagmi hooks on client-side to prevent SSR errors
  const { open } = isClient ? useWeb3Modal() : { open: () => {} };
  const { address, isConnected, chain, connector } = isClient ? useAccount() : { address: undefined, isConnected: false, chain: undefined, connector: undefined };
  const connectedChainId = isClient ? useChainId() : 1;
  const config = isClient ? useConfig() : undefined;
  const publicClient = isClient ? usePublicClient({ chainId: mainnet.id }) : undefined;
  const { switchChainAsync } = isClient ? useSwitchChain() : { switchChainAsync: async () => {} };
  const { sendTransactionAsync } = isClient ? useSendTransaction() : { sendTransactionAsync: async () => Promise.resolve('0x' as `0x${string}`) };
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = isClient ? useWaitForTransactionReceipt({
    hash: txHash,
  }) : { isLoading: false, isSuccess: false, error: null };
  
  // Refs to prevent duplicate calls and React errors
  const fetchingUserEntryRef = useRef(false);
  const processingEntryRef = useRef(false);
  const isUpdatingStateRef = useRef(false);
  const isMountedRef = useRef(true);
  const stateUpdateQueueRef = useRef<Array<() => void>>([]);
  const isProcessingQueueRef = useRef(false);
  
  // Track mount status to prevent state updates after unmount
  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stateUpdateQueueRef.current = []; // Clear queue on unmount
    };
  }, []);
  
  // Process state update queue after render completes
  useEffect(() => {
    if (stateUpdateQueueRef.current.length > 0 && !isProcessingQueueRef.current) {
      isProcessingQueueRef.current = true;
      // Use requestIdleCallback if available, otherwise setTimeout with longer delay
      const scheduleUpdate = typeof requestIdleCallback !== 'undefined' 
        ? requestIdleCallback 
        : (cb: () => void) => setTimeout(cb, 100);
      
      scheduleUpdate(() => {
        if (!isMountedRef.current) {
          stateUpdateQueueRef.current = [];
          isProcessingQueueRef.current = false;
          return;
        }
        
        const updates = stateUpdateQueueRef.current.slice();
        stateUpdateQueueRef.current = [];
        
        // Batch all updates in a single startTransition
        startTransition(() => {
          updates.forEach(update => {
            if (isMountedRef.current) {
              update();
            }
          });
        });
        
        isProcessingQueueRef.current = false;
      });
    }
  });
  
  // Helper function to safely queue state updates (batched and deferred)
  const safeSetState = useCallback(<T,>(setter: (value: T) => void, value: T) => {
    if (!isMountedRef.current) return;
    stateUpdateQueueRef.current.push(() => {
      if (isMountedRef.current) {
        setter(value);
      }
    });
  }, []);


  const fetchRaffle = useCallback(async () => {
    const raffleId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
    if (!raffleId) {
      console.error('[Raffle] No raffle ID found in params:', params);
      safeSetState(setLoading, false);
      return;
    }
    
    try {
      console.log('[Raffle] Fetching raffle with ID:', raffleId);
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();

      if (error) {
        console.error('[Raffle] Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('[Raffle] No data returned for ID:', raffleId);
        safeSetState(setRaffle, null);
        safeSetState(setLoading, false);
        return;
      }
      
      console.log('[Raffle] Successfully fetched raffle:', data.title);
      // Queue state updates to be batched after render
      safeSetState(setRaffle, data);
      safeSetState(setLoading, false);
    } catch (error: any) {
      console.error('[Raffle] Error fetching raffle:', error?.message || error);
      safeSetState(setRaffle, null);
      safeSetState(setLoading, false);
    }
  }, [params.id]);

  // Memoized fetch functions to prevent React errors
  const fetchEntryCount = useCallback(async () => {
    if (!raffle?.id) return;
    try {
      const { count, error } = await supabase
        .from('raffle_entries')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', raffle.id);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('401')) {
          return; // Silent fail for 401
        }
        throw error;
      }
      // Queue state update
      safeSetState(setEntryCount, count || 0);
    } catch (error: any) {
      console.warn('[Entry Count] Error:', error?.message);
    }
  }, [raffle?.id]);

  const fetchEntries = useCallback(async () => {
    if (!raffle?.id) return;
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

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('401')) {
          safeSetState(setEntries, []);
          return;
        }
        throw error;
      }
      safeSetState(setEntries, (data as any) || []);
    } catch (error: any) {
      console.warn('[Entries] Error:', error?.message);
      safeSetState(setEntries, []);
    }
  }, [raffle?.id]);

  const fetchWinner = useCallback(async () => {
    if (!raffle?.winner_user_id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', raffle.winner_user_id)
        .single();

      if (error) throw error;
      safeSetState(setWinner, {
        wallet_address: data.wallet_address,
        drawn_at: raffle.winner_drawn_at || '',
      });
    } catch (error) {
      console.warn('[Winner] Error:', error);
    }
  }, [raffle?.winner_user_id, raffle?.winner_drawn_at]);

  // Pure function for Google Drive URL conversion (safe to call during render)
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

  // Memoize converted image URL to prevent unnecessary recalculations
  const convertedImageUrl = useMemo(() => {
    return raffle?.image_url ? convertGoogleDriveUrl(raffle.image_url) || raffle.image_url : null;
  }, [raffle?.image_url]);

  // Memoized fetch functions to prevent React errors #418/#423
  const fetchUserEntry = useCallback(async () => {
    if (!raffle || !address || fetchingUserEntryRef.current) return;
    fetchingUserEntryRef.current = true;
    
    try {
      // Use API route to get/create user (bypasses RLS, no 401 errors)
      const response = await fetch(`/api/users/get-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        // If API fails, just skip - user can still pay
        console.warn('[User Entry] API call failed, skipping entry check');
        return;
      }

      const { userId } = await response.json();
      if (!userId) return;

      // Check for existing entry using API route (bypasses RLS)
      const entryResponse = await fetch(`/api/raffles/${raffle.id}/check-entry?userId=${userId}`);
      if (entryResponse.ok) {
        const entryData = await entryResponse.json();
        if (entryData.entry) {
          safeSetState(setUserEntry, entryData.entry);
        }
      }
    } catch (error: any) {
      // Silent fail - don't block payment flow
      console.warn('[User Entry] Error:', error?.message || 'Unknown error');
    } finally {
      fetchingUserEntryRef.current = false;
    }
  }, [raffle?.id, address]);

  const checkAndDrawWinner = useCallback(async () => {
    if (!raffle?.id) return;
    
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
            // Refresh raffle data to show winner - use requestAnimationFrame to ensure it happens after render
            requestAnimationFrame(() => {
              setTimeout(() => {
                fetchRaffle();
                fetchWinner();
              }, 100);
            });
          }
        }
      } catch (error) {
        console.warn('[Draw Winner] Error:', error);
      }
    }
  }, [raffle?.id, raffle?.ends_at, raffle?.winner_user_id, raffle?.status, fetchRaffle, fetchWinner]);

  // Separate effects with memoized functions to prevent React errors #418/#423
  // Use useLayoutEffect for critical initial load, regular useEffect for others
  // Defer all state updates to next tick to prevent render conflicts
  // These must be AFTER all function declarations
  useLayoutEffect(() => {
    if (!mounted || !isClient) return;
    
    const raffleId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
    if (raffleId && isMountedRef.current) {
      // Use requestIdleCallback or setTimeout to ensure update happens after render
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          fetchRaffle();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [mounted, params.id, fetchRaffle]);

  useEffect(() => {
    if (raffle?.id && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          fetchEntryCount();
          fetchEntries();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [raffle?.id, fetchEntryCount, fetchEntries]);

  useEffect(() => {
    if (raffle?.winner_user_id && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          fetchWinner();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [raffle?.winner_user_id, fetchWinner]);

  useEffect(() => {
    if (raffle?.id && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          checkAndDrawWinner();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [raffle?.id, raffle?.ends_at, checkAndDrawWinner]);

  useEffect(() => {
    if (raffle?.id && address && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          fetchUserEntry();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [raffle?.id, address, fetchUserEntry]);

  // Auto-refresh entries every 5 seconds for live updates
  // Defer updates to prevent React errors
  useEffect(() => {
    if (!raffle?.id || !isMountedRef.current) return;
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchEntryCount();
            fetchEntries();
          }
        }, 0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [raffle?.id, fetchEntryCount, fetchEntries]);

  const REQUIRED_CHAIN_ID = 1; // Ethereum mainnet (MANDATORY for ETH transfers)
  const PAYOUT_ADDRESS = '0x842bab27dE95e329eb17733c1f29c082e5dd94c3' as `0x${string}`;

  /**
   * Mobile WalletConnect Payment Handler
   * 
   * This function handles simple ETH transfers (no smart contracts).
   * It explicitly enforces chainId = 1 (Ethereum mainnet) and includes
   * all required transaction fields to work reliably on mobile wallets.
   */
  const handleEnterRaffle = async () => {
    if (!raffle) return;

    // 1. Wallet connection validation (MANDATORY for mobile wallets)
    if (!address) {
      const connect = confirm(
        'Please connect your wallet to enter the raffle.\n\nClick OK to open wallet connection.'
      );
      if (connect) {
        open();
      }
      return;
    }

    if (!isConnected) {
      alert('Wallet is not fully connected. Please reconnect your wallet and try again.');
      return;
    }

    // 2. Business logic checks
    if (userEntry) {
      alert('You have already entered this raffle! Check your dashboard to see your ticket.');
      return;
    }

    const now = new Date();
    const endsAt = new Date(raffle.ends_at);
    if (endsAt <= now) {
      alert('This raffle has ended! Check the Ended Raffles page.');
      router.push('/ended');
      return;
    }

    if (entryCount >= raffle.max_tickets) {
      alert('This raffle is full! All tickets have been sold.');
      return;
    }

    // 3. Network detection and validation (CRITICAL for mobile wallets)
    // Get current chain - use multiple sources for reliability
    let currentChainId: number | undefined = connectedChainId ?? chain?.id;
    
    // If still undefined, try to get from connector
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
    
    // BLOCK if chain is still undefined (mobile wallets REQUIRE explicit chainId)
    if (!currentChainId) {
      alert(
        'Unable to detect your current network. Please reconnect your wallet and ensure you are on Ethereum Mainnet.'
      );
      return;
    }

    // 4. Network guard: ALWAYS enforce Ethereum mainnet for ETH raffles
    // Mobile wallets require explicit chainId, so we MUST switch if not on mainnet
    if (raffle.prize_pool_symbol?.toUpperCase() === 'ETH') {
      if (currentChainId !== REQUIRED_CHAIN_ID) {
        try {
          console.log(`[Payment] Current chain: ${currentChainId}, required: ${REQUIRED_CHAIN_ID}`);
          console.log(`[Payment] Switching to Ethereum Mainnet (chainId: ${REQUIRED_CHAIN_ID})...`);
          
          // Switch chain
          await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
          
          // Poll for chain to actually be 1 (mobile wallets need time to sync)
          let verifiedChainId: number | undefined = undefined;
          const maxAttempts = 10;
          const pollInterval = 500; // 500ms between checks
          
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            
            // Check all sources for chainId
            verifiedChainId = connectedChainId ?? chain?.id;
            
            // If still not found, try connector
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
                // Ignore errors, continue polling
              }
            }
            
            if (verifiedChainId === REQUIRED_CHAIN_ID) {
              console.log(`[Payment] Chain verified as ${REQUIRED_CHAIN_ID} after ${attempt + 1} attempt(s)`);
              break;
            }
            
            console.log(`[Payment] Chain check ${attempt + 1}/${maxAttempts}: ${verifiedChainId || 'undefined'}`);
          }
          
          // Final verification - BLOCK if chain is not 1
          if (verifiedChainId !== REQUIRED_CHAIN_ID) {
            throw new Error(
              `Failed to switch to Ethereum Mainnet. Current chain: ${verifiedChainId || 'undefined'}. Please manually switch your wallet to Ethereum Mainnet (chainId: 1) and try again.`
            );
          }
          
          currentChainId = verifiedChainId;
          console.log(`[Payment] Successfully switched and verified chain: ${currentChainId}`);
        } catch (error: any) {
          console.error('[Payment] Network switch error:', error);
          const errorMsg = error?.message || 'Failed to switch network';
          alert(
            `${errorMsg}\n\nPlease switch your wallet to Ethereum Mainnet (chainId: 1) and try again.`
          );
          startTransition(() => {
            setEntering(false);
          });
          return;
        }
      }
    }

    // 5. Final chain verification before transaction (mobile wallet safety check)
    // Re-check one more time right before sending (chain might have changed)
    let finalChainId = connectedChainId ?? chain?.id ?? currentChainId;
    
    // If still not found, try connector one last time
    if (!finalChainId && connector) {
      try {
        const provider = await connector.getProvider();
        if (provider && typeof provider === 'object' && provider !== null && 'chainId' in provider) {
          const chainIdValue = (provider as { chainId?: string | number }).chainId;
          if (chainIdValue !== undefined) {
            const providerChainId = typeof chainIdValue === 'string' 
              ? parseInt(chainIdValue, 16) 
              : chainIdValue;
            if (typeof providerChainId === 'number') {
              finalChainId = providerChainId;
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    // CRITICAL: Block transaction if chain is undefined or not mainnet
    if (!finalChainId) {
      alert(
        'Unable to verify network. Please reconnect your wallet and ensure you are on Ethereum Mainnet.'
      );
      safeSetState(setEntering, false);
      return;
    }
    
    if (finalChainId !== REQUIRED_CHAIN_ID) {
      alert(
        `This raffle requires Ethereum Mainnet (chainId: 1).\n\nYour current network: chainId ${finalChainId}\n\nPlease switch to Ethereum Mainnet and try again.`
      );
      safeSetState(setEntering, false);
      return;
    }

    // 6. Confirm purchase
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

    safeSetState(setEntering, true);

    try {
      // 7. Final validation - BLOCK if anything is missing (mobile wallet requirement)
      if (!address) {
        throw new Error('Missing sender address. Please reconnect your wallet.');
      }
      
      // CRITICAL: Re-verify chainId one last time right before sending
      // Mobile wallets can have timing issues, so we check again
      const lastChainCheck = connectedChainId ?? chain?.id;
      if (!lastChainCheck || lastChainCheck !== REQUIRED_CHAIN_ID) {
        throw new Error(
          `Chain verification failed. Expected chainId: ${REQUIRED_CHAIN_ID}, got: ${lastChainCheck || 'undefined'}. Please ensure you are on Ethereum Mainnet.`
        );
      }
      
      if (!PAYOUT_ADDRESS) {
        throw new Error('Missing recipient address. Please contact support.');
      }

      // 8. Parse ETH value to wei (BigInt)
      const value = parseEther(raffle.ticket_price.toString());
      
      // 9. Verify chain is properly configured and get public client
      // Using usePublicClient ensures the chain object is available for transaction serialization
      if (!publicClient) {
        throw new Error(
          'Ethereum Mainnet client not available. Please ensure mainnet is configured in Wagmi.'
        );
      }
      
      // Ensure chain is properly synced before sending (mobile wallets can be slow)
      if (!chain || chain.id !== REQUIRED_CHAIN_ID) {
        console.log('[Payment] Chain object not immediately available, waiting for sync...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('[Payment] Final transaction payload:', {
        from: address,
        to: PAYOUT_ADDRESS,
        value: value.toString(),
        chainId: mainnet.id,
        chainName: mainnet.name,
        publicClientAvailable: !!publicClient,
        currentChainFromHook: chain?.id,
        connectedChainId,
      });

      // 10. Simple ETH transfer with EXPLICIT fields (required for mobile wallets)
      // This is a raw ETH transfer - NO smart contract, NO ABI, NO calldata
      // CRITICAL: Using publicClient ensures chain object is available for serialization
      // The chainId is explicitly set to ensure mobile wallets receive the correct network
      const hash = await sendTransactionAsync({
        account: address as `0x${string}`,
        to: PAYOUT_ADDRESS,
        value,
        chainId: mainnet.id, // Explicit chainId - publicClient ensures chain object is available
      });

      console.log('[Payment] Transaction sent:', hash);
      safeSetState(setTxHash, hash);
    } catch (error: any) {
      console.error('[Payment] Transaction error:', error);

      // 10. Mobile-friendly error handling
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
        safeSetState(setError, userMessage);
        safeSetState(setEntering, false);
        safeSetState(setTxHash, undefined); // Reset to allow retry
        setTimeout(() => alert(userMessage), 0);
      }
    }
  };

  // Memoized payment success handler to prevent React errors
  const handlePaymentSuccess = useCallback(async () => {
    if (!raffle || !address || !txHash || processingEntryRef.current) return;

    processingEntryRef.current = true;
    safeSetState(setProcessingEntry, true);
    safeSetState(setError, null);

    try {
      // Call API to create entry - this uses service role key, so no auth needed
      const response = await fetch(`/api/raffles/${raffle.id}/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          txHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create entry`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create raffle entry');
      }

      // Success - show message
      if (data.duplicate) {
        alert('You have already entered this raffle! Transaction hash updated.');
      } else {
        alert('Payment successful! You have entered the raffle. Your ticket is now in your profile.');
      }

      // Refresh UI data (non-blocking) - use startTransition to batch updates
      startTransition(() => {
        setTimeout(() => {
          fetchEntryCount();
          fetchEntries();
          fetchUserEntry();
        }, 100);
      });
      
    } catch (error: any) {
      // Don't throw - payment was successful, entry creation failed
      const errorMsg = error?.message || 'Unknown error';
      console.warn('[Payment Success] Entry creation failed:', errorMsg);
      
      // Show user-friendly message
      alert(
        `Payment successful! However, there was an issue saving your entry.\n\n` +
        `Transaction Hash: ${txHash}\n\n` +
        `Please contact support with this transaction hash to verify your entry.`
      );
      
      safeSetState(setError, `Entry creation failed: ${errorMsg}`);
    } finally {
      processingEntryRef.current = false;
      safeSetState(setProcessingEntry, false);
      safeSetState(setEntering, false);
      // Don't reset txHash - keep it for reference
    }
  }, [raffle?.id, address, txHash, fetchEntryCount, fetchEntries, fetchUserEntry]);

  // Handle successful payment confirmation - prevent React errors #418/#423
  // Defer to next tick to ensure we're not in render cycle
  useEffect(() => {
    if (isConfirmed && txHash && raffle?.id && address && !processingEntryRef.current && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          handlePaymentSuccess();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isConfirmed, txHash, raffle?.id, address, handlePaymentSuccess]);

  // Handle payment errors - prevent cascading failures
  // Defer to next tick to prevent React errors
  useEffect(() => {
    if (txError && !processingEntryRef.current && isMountedRef.current) {
      const errorMessage = txError.message || 'Payment failed. Please try again.';
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          queueMicrotask(() => {
            if (isMountedRef.current) {
              startTransition(() => {
                if (isMountedRef.current) {
                  setError(errorMessage);
                  setEntering(false);
                  setTxHash(undefined); // Reset to allow retry
                }
              });
            }
          });
          // Alert outside of state update to avoid blocking
          setTimeout(() => {
            alert(errorMessage);
          }, 10);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [txError]);

  // Memoize derived values to prevent unnecessary recalculations during render
  const isRaffleEnded = useMemo(() => {
    if (!raffle?.ends_at) return false;
    return new Date(raffle.ends_at) <= new Date();
  }, [raffle?.ends_at]);

  // Show loading state during SSR or while mounting
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
              onClick={() => router.push('/raffles')}
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
        {/* Banner Image */}
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

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400 text-center font-semibold">
                      ⚠️ {error}
                    </p>
                    <button
                      onClick={() => setError(null)}
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
