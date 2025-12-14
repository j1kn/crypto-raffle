import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// API endpoint to draw a random winner for a completed raffle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const supabase = createServerClient();

    // Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 });
    }

    // Check if raffle has ended
    const now = new Date();
    const endsAt = new Date(raffle.ends_at);
    if (endsAt > now) {
      return NextResponse.json(
        { error: 'Raffle has not ended yet' },
        { status: 400 }
      );
    }

    // Check if winner already drawn
    if (raffle.winner_user_id) {
      return NextResponse.json(
        { error: 'Winner already drawn', winner_user_id: raffle.winner_user_id },
        { status: 400 }
      );
    }

    // Get all entries for this raffle
    const { data: entries, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('user_id')
      .eq('raffle_id', raffleId);

    if (entriesError) {
      throw entriesError;
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found for this raffle' },
        { status: 400 }
      );
    }

    // Draw random winner
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winnerEntry = entries[randomIndex];
    const winnerUserId = winnerEntry.user_id;

    // Update raffle with winner
    const { data: updatedRaffle, error: updateError } = await supabase
      .from('raffles')
      .update({
        winner_user_id: winnerUserId,
        winner_drawn_at: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', raffleId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Get winner user details
    const { data: winnerUser, error: winnerUserError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', winnerUserId)
      .single();

    if (winnerUserError) {
      throw winnerUserError;
    }

    return NextResponse.json({
      success: true,
      winner: {
        user_id: winnerUserId,
        wallet_address: winnerUser.wallet_address,
        drawn_at: updatedRaffle.winner_drawn_at,
      },
    });
  } catch (error: any) {
    console.error('Error drawing winner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to draw winner' },
      { status: 500 }
    );
  }
}

