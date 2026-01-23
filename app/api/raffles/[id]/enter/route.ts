import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Create a raffle entry after successful on-chain payment
// Uses Supabase SERVICE ROLE key to bypass RLS safely
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const body = await request.json();
    const { walletAddress, txHash, email, quantity } = body as {
      walletAddress?: string;
      txHash?: string;
      email?: string;
      quantity?: number;
    };

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing walletAddress' },
        { status: 400 }
      );
    }

    // Validate quantity
    const ticketQuantity = quantity && quantity > 0 ? quantity : 1;
    if (ticketQuantity < 1 || ticketQuantity > 100) { // Reasonable limit
      return NextResponse.json(
        { error: 'Invalid quantity. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Create or fetch user by wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (userError || !userData) {
      console.error('Error upserting user in enter API:', userError);
      throw userError || new Error('Failed to create user');
    }

    // CRITICAL: Verify user passed the quiz for this raffle
    const { data: quizAttempt, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('id, passed, score')
      .eq('raffle_id', raffleId)
      .eq('user_id', userData.id)
      .eq('passed', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (quizError || !quizAttempt) {
      console.error('Quiz validation failed:', quizError);
      return NextResponse.json(
        { error: 'You must pass the skill quiz before entering this raffle. Please complete the quiz first.' },
        { status: 403 }
      );
    }

    // Fetch raffle data including free ticket settings
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('max_tickets, free_ticket_percentage, entry_limit_per_wallet, ticket_price')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffleData) {
      console.error('Error fetching raffle:', raffleError);
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    const maxTickets = raffleData.max_tickets;
    const freeTicketPercentage = raffleData.free_ticket_percentage || 0;
    const entryLimitPerWallet = raffleData.entry_limit_per_wallet || Math.floor(maxTickets * 0.2); // Use custom limit or default 20%
    const maxUserTickets = entryLimitPerWallet;

    // Calculate user's current total tickets for this raffle
    const { data: userEntriesData, error: userEntriesError } = await supabase
      .from('raffle_entries')
      .select('quantity')
      .eq('raffle_id', raffleId)
      .eq('user_id', userData.id);

    if (userEntriesError) {
      console.error('Error fetching user entries:', userEntriesError);
      return NextResponse.json(
        { error: 'Failed to check user ticket holdings' },
        { status: 500 }
      );
    }

    const userCurrentTickets = (userEntriesData || []).reduce((sum, entry) => sum + (entry.quantity || 1), 0);
    const userNewTotal = userCurrentTickets + ticketQuantity;

    // Check entry limit per wallet
    if (userNewTotal > maxUserTickets) {
      const remainingAllowed = Math.max(0, maxUserTickets - userCurrentTickets);
      return NextResponse.json(
        {
          error: `You cannot purchase more than ${maxUserTickets} tickets. You currently have ${userCurrentTickets} tickets. Maximum ${remainingAllowed} more tickets allowed.`
        },
        { status: 400 }
      );
    }

    // Calculate current total tickets sold (all users)
    const { data: entriesData, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('quantity')
      .eq('raffle_id', raffleId);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      return NextResponse.json(
        { error: 'Failed to check ticket availability' },
        { status: 500 }
      );
    }

    const totalTicketsSold = (entriesData || []).reduce((sum, entry) => sum + (entry.quantity || 1), 0);
    const availableTickets = maxTickets - totalTicketsSold;

    if (availableTickets < ticketQuantity) {
      return NextResponse.json(
        { error: `Not enough tickets available. Only ${availableTickets} tickets left.` },
        { status: 400 }
      );
    }

    // Calculate if this entry qualifies for free tickets
    const freeTicketLimit = Math.floor(maxTickets * (freeTicketPercentage / 100));
    const isFreeEntry = freeTicketLimit > 0 && totalTicketsSold < freeTicketLimit;

    // If this is a free entry, we don't require txHash
    if (!isFreeEntry && !txHash) {
      return NextResponse.json(
        { error: 'Missing transaction hash for paid entry' },
        { status: 400 }
      );
    }

    // Try to create raffle entry
    const entryData = {
      raffle_id: raffleId,
      user_id: userData.id,
      tx_hash: isFreeEntry ? null : txHash, // Free entries don't need tx_hash
      quantity: ticketQuantity,
      is_free_entry: isFreeEntry,
      ...(email && email.trim() && { email: email.trim() }), // Only include email if provided and not empty
    };

    const { data: entryResult, error: entryError } = await supabase
      .from('raffle_entries')
      .insert(entryData)
      .select()
      .single();

    if (entryError) {
      console.error('Error inserting raffle entry:', entryError);
      throw entryError;
    }

    return NextResponse.json({
      success: true,
      entry: entryResult,
      isFreeEntry: isFreeEntry,
      message: isFreeEntry
        ? `Congratulations! You got ${ticketQuantity} FREE ticket${ticketQuantity > 1 ? 's' : ''} (first ${freeTicketPercentage}% are free)!`
        : `Successfully purchased ${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''}!`
    });
  } catch (error: any) {
    console.error('Error in /api/raffles/[id]/enter:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create raffle entry' },
      { status: 500 }
    );
  }
}


