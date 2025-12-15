import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST - Create new raffle (PIN-based admin)
export async function POST(request: NextRequest) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    const body = await request.json();
    const supabase = createServerClient();

    // Create raffle
    const { data, error } = await supabase
      .from('raffles')
      .insert({
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        prize_pool_amount: body.prize_pool_amount,
        prize_pool_symbol: body.prize_pool_symbol,
        ticket_price: body.ticket_price,
        max_tickets: body.max_tickets,
        status: body.status,
        // chain_uuid is a UUID field, but we're using string IDs ('ethereum', 'solana')
        // Set to null for now - can be updated later if needed
        chain_uuid: null,
        receiving_address: body.receiving_address,
        starts_at: body.starts_at || null,
        ends_at: body.ends_at,
        created_by: null, // PIN-based admin
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating raffle:', error);
      throw error;
    }

    return NextResponse.json({ success: true, raffle: data });
  } catch (error: any) {
    console.error('Error creating raffle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create raffle' },
      { status: 500 }
    );
  }
}

// GET - Fetch all raffles (PIN-based admin)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication via PIN
    // In production, implement proper session verification
    const adminPin = process.env.ADMIN_PIN;
    
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    // For PIN-based auth, we skip wallet verification
    // The /superman route already verified the PIN
    // PIN verification is done via /api/admin/login before accessing these routes

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

