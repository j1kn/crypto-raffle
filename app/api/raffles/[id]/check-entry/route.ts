import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check for existing entry using service role key (bypasses RLS)
    const { data, error } = await supabase
      .from('raffle_entries')
      .select('*')
      .eq('raffle_id', raffleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase entry check error:', error);
      return NextResponse.json({ error: 'Failed to check entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data || null });
  } catch (error: any) {
    console.error('API Error /api/raffles/[id]/check-entry:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

