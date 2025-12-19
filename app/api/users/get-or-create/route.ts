import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Upsert user using service role key (bypasses RLS)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
      .select('id')
      .single();

    if (userError || !userData) {
      console.error('Supabase user upsert error:', userError);
      return NextResponse.json({ error: 'Failed to get or create user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: userData.id });
  } catch (error: any) {
    console.error('API Error /api/users/get-or-create:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

