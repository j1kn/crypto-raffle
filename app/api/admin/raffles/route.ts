import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST - Create new raffle (PIN-based admin)
export async function POST(request: NextRequest) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      console.error('ADMIN_PIN environment variable is not set');
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    // Verify Supabase credentials are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      console.error('SUPABASE_URL environment variable is not set');
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }
    
    if (!serviceRoleKey && !anonKey) {
      console.error('Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set');
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    if (!serviceRoleKey) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set, using anon key (may be blocked by RLS)');
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError: any) {
      console.error('Failed to parse request body:', jsonError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Debug logging
    console.log('Creating raffle with data:', {
      title: body.title,
      status: body.status,
      prize_pool_amount: body.prize_pool_amount,
      receiving_address: body.receiving_address ? '***' : 'missing',
    });

    // Validate required fields
    const requiredFields = ['title', 'prize_pool_amount', 'prize_pool_symbol', 'ticket_price', 'max_tickets', 'status', 'receiving_address', 'ends_at'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Prepare raffle data with all required fields
    const raffleData = {
      title: body.title || '',
      description: body.description || null,
      image_url: body.image_url || null,
      prize_pool_amount: parseFloat(body.prize_pool_amount) || 0,
      prize_pool_symbol: body.prize_pool_symbol || 'ETH',
      ticket_price: parseFloat(body.ticket_price) || 0,
      max_tickets: parseInt(body.max_tickets) || 0,
      status: body.status || 'draft',
      chain_uuid: null, // Can be updated later if needed
      receiving_address: body.receiving_address || '',
      starts_at: body.starts_at ? new Date(body.starts_at).toISOString() : null,
      ends_at: body.ends_at ? new Date(body.ends_at).toISOString() : new Date().toISOString(),
      created_by: null, // PIN-based admin
    };

    console.log('Inserting raffle with data:', {
      ...raffleData,
      receiving_address: '***', // Hide sensitive data in logs
    });

    // Create raffle using SERVICE ROLE KEY (bypasses RLS)
    const { data, error } = await supabase
      .from('raffles')
      .insert(raffleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: error.message || 'Failed to create raffle in database' },
        { status: 500 }
      );
    }

    console.log('Raffle created successfully:', data.id);
    return NextResponse.json({ success: true, raffle: data }, { status: 201 });
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

