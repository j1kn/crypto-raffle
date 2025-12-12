import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// This route allows admins to fetch all raffles including receiving_address
// Note: In production, use Supabase service role key to bypass RLS
export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.headers.get('x-wallet-address');
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim().toLowerCase()) || [];
    if (!adminWallets.includes(walletAddress.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Note: This will still be subject to RLS with anon key
    // For full admin access, use service role key:
    // const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ raffles: data || [] });
  } catch (error: any) {
    console.error('Error fetching raffles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

