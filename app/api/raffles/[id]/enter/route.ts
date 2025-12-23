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

    if (!walletAddress || !txHash) {
      return NextResponse.json(
        { error: 'Missing walletAddress or txHash' },
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

    // Check if there are enough tickets available
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('max_tickets')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffleData) {
      console.error('Error fetching raffle:', raffleError);
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Calculate current total tickets sold
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
    const availableTickets = raffleData.max_tickets - totalTicketsSold;

    if (availableTickets < ticketQuantity) {
      return NextResponse.json(
        { error: `Not enough tickets available. Only ${availableTickets} tickets left.` },
        { status: 400 }
      );
    }

    // Try to create raffle entry with transaction hash
    const entryData = {
      raffle_id: raffleId,
      user_id: userData.id,
      tx_hash: txHash,
      quantity: ticketQuantity,
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
    });
  } catch (error: any) {
    console.error('Error in /api/raffles/[id]/enter:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create raffle entry' },
      { status: 500 }
    );
  }
}


