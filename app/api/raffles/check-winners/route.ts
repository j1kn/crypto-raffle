import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// API endpoint to check and draw winners for all ended raffles
// This can be called by a cron job or manually
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Find all live raffles that have ended but don't have a winner
    const { data: endedRaffles, error: fetchError } = await supabase
      .from('raffles')
      .select('*')
      .eq('status', 'live')
      .is('winner_user_id', null)
      .lte('ends_at', now);

    if (fetchError) {
      throw fetchError;
    }

    if (!endedRaffles || endedRaffles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No raffles need winner drawing',
        drawn: 0,
      });
    }

    const results = [];

    for (const raffle of endedRaffles) {
      try {
        // Get all entries for this raffle
        const { data: entries, error: entriesError } = await supabase
          .from('raffle_entries')
          .select('user_id')
          .eq('raffle_id', raffle.id);

        if (entriesError) {
          console.error(`Error fetching entries for raffle ${raffle.id}:`, entriesError);
          continue;
        }

        if (!entries || entries.length === 0) {
          // No entries, mark as completed without winner
          await supabase
            .from('raffles')
            .update({
              status: 'completed',
            })
            .eq('id', raffle.id);
          continue;
        }

        // Draw random winner
        const randomIndex = Math.floor(Math.random() * entries.length);
        const winnerEntry = entries[randomIndex];
        const winnerUserId = winnerEntry.user_id;

        // Update raffle with winner
        const { error: updateError } = await supabase
          .from('raffles')
          .update({
            winner_user_id: winnerUserId,
            winner_drawn_at: new Date().toISOString(),
            status: 'completed',
          })
          .eq('id', raffle.id);

        if (updateError) {
          console.error(`Error updating raffle ${raffle.id}:`, updateError);
          continue;
        }

        // Get winner user details
        const { data: winnerUser } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('id', winnerUserId)
          .single();

        results.push({
          raffle_id: raffle.id,
          raffle_title: raffle.title,
          winner_wallet: winnerUser?.wallet_address || 'Unknown',
        });
      } catch (error: any) {
        console.error(`Error processing raffle ${raffle.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Drew winners for ${results.length} raffle(s)`,
      drawn: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error checking winners:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check winners' },
      { status: 500 }
    );
  }
}

