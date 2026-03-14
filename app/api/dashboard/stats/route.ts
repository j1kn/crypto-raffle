import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/dashboard/stats?walletAddress=0x...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        activeRaffles: 0,
        totalEntries: 0,
        pendingDraws: 0,
        wins: 0,
      });
    }

    const userId = userData.id;

    // Get all entries with raffle details
    const { data: entries, error: entriesError } = await supabase
      .from('raffle_entries')
      .select(`
        raffle_id,
        raffles!inner (
          status,
          winner_user_id,
          ends_at
        )
      `)
      .eq('user_id', userId);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      throw entriesError;
    }

    // Calculate stats
    const totalEntries = entries?.length || 0;
    
    // Active raffles: entries in raffles with status 'live'
    const activeRaffles = entries?.filter(
      (entry: any) => entry.raffles?.status === 'live'
    ).length || 0;

    // Pending draws: entries in raffles that are completed but no winner yet
    const pendingDraws = entries?.filter(
      (entry: any) => 
        entry.raffles?.status === 'completed' && 
        !entry.raffles?.winner_user_id
    ).length || 0;

    // Wins: entries in raffles where user is the winner
    const wins = entries?.filter(
      (entry: any) => entry.raffles?.winner_user_id === userId
    ).length || 0;

    return NextResponse.json({
      activeRaffles,
      totalEntries,
      pendingDraws,
      wins,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}

