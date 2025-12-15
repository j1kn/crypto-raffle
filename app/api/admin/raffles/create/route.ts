
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, raffleData } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Verify Admin
    const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim().toLowerCase()) || [];
    const isAdmin = adminWallets.includes(walletAddress.toLowerCase());

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Initialize Supabase with Service Role Key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing server-side Supabase configuration');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Handle User Upsert (Ensure creator exists)
    // We do this with service role as well to avoid RLS issues on the users table if any
    const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
        .select()
        .single();

    if (userError) {
        console.error('Error upserting user:', userError);
        throw new Error(`User error: ${userError.message}`);
    }

    // Prepare Raffle Data
    const insertData = {
        ...raffleData,
        created_by: userData.id,
        // Ensure numbers are numbers
        prize_pool_amount: parseFloat(raffleData.prize_pool_amount),
        ticket_price: parseFloat(raffleData.ticket_price),
        max_tickets: parseInt(raffleData.max_tickets),
        // Handle dates
        starts_at: raffleData.starts_at || null,
        ends_at: raffleData.ends_at,
        chain_uuid: raffleData.chain_uuid || null
    };

    // Remove undefined
    Object.keys(insertData).forEach(key => insertData[key] === undefined && delete insertData[key]);

    // Insert Raffle
    const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .insert(insertData)
        .select()
        .single();

    if (raffleError) {
        console.error('Error inserting raffle:', raffleError);
        throw new Error(`Raffle error: ${raffleError.message}`);
    }

    return NextResponse.json({ success: true, data: raffle });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
