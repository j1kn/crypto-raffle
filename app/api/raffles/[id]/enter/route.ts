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
    const { walletAddress, txHash } = body as {
      walletAddress?: string;
      txHash?: string;
    };

    if (!walletAddress || !txHash) {
      return NextResponse.json(
        { error: 'Missing walletAddress or txHash' },
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

    // Try to create raffle entry with transaction hash
    const { data: entryData, error: entryError } = await supabase
      .from('raffle_entries')
      .insert({
        raffle_id: raffleId,
        user_id: userData.id,
        tx_hash: txHash,
      })
      .select()
      .single();

    if (entryError) {
      // Handle duplicate entry (unique constraint on raffle_id, user_id)
      if ((entryError as any).code === '23505') {
        const { data: existing, error: updateError } = await supabase
          .from('raffle_entries')
          .update({ tx_hash: txHash })
          .eq('raffle_id', raffleId)
          .eq('user_id', userData.id)
          .select()
          .maybeSingle();

        if (updateError) {
          console.error('Error updating existing entry tx_hash:', updateError);
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          duplicate: true,
          entry: existing,
        });
      }

      console.error('Error inserting raffle entry:', entryError);
      throw entryError;
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
      entry: entryData,
    });
  } catch (error: any) {
    console.error('Error in /api/raffles/[id]/enter:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create raffle entry' },
      { status: 500 }
    );
  }
}


