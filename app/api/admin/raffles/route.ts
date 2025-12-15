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
    // REQUIRED: Use SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (not NEXT_PUBLIC_ vars)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      console.error('SUPABASE_URL environment variable is not set');
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }
    
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is REQUIRED for admin operations');
      console.error('❌ Anon key cannot bypass RLS policies');
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY is required. Anon key will be blocked by RLS.' 
      }, { status: 500 });
    }
    
    console.log('✅ Using SERVICE ROLE KEY for admin operation (bypasses RLS)');

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

    // Create Supabase client with service role key
    let supabase;
    try {
      supabase = createServerClient();
      console.log('✅ Supabase client created, attempting insert...');
    } catch (clientError: any) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json(
        { error: `Failed to initialize database connection: ${clientError.message}` },
        { status: 500 }
      );
    }

    // Prepare raffle data with all required fields
    // IMPORTANT: Remove undefined values - they trigger RLS failures
    const raffleData: any = {
      title: body.title || '',
      description: body.description !== undefined ? body.description : null,
      image_url: body.image_url !== undefined ? body.image_url : null,
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
    
    // Remove any undefined values (they cause RLS violations)
    Object.keys(raffleData).forEach(key => {
      if (raffleData[key] === undefined) {
        console.warn(`⚠️ Removing undefined value for field: ${key}`);
        delete raffleData[key];
      }
    });
    
    // Validate no critical fields are missing
    if (!raffleData.title || !raffleData.receiving_address || !raffleData.ends_at) {
      console.error('Critical fields missing after cleanup:', raffleData);
      return NextResponse.json(
        { error: 'Critical fields are missing or invalid' },
        { status: 400 }
      );
    }

    console.log('Inserting raffle with data:', {
      ...raffleData,
      receiving_address: '***', // Hide sensitive data in logs
    });

    // Create raffle using SERVICE ROLE KEY (bypasses RLS)
    console.log('📝 Attempting to insert raffle into database...');
    console.log('📝 Using service role key (should bypass RLS)');
    
    const { data, error } = await supabase
      .from('raffles')
      .insert(raffleData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // Check if it's an RLS error
      if (error.message?.includes('row-level security') || error.message?.includes('RLS') || error.code === '42501') {
        console.error('🚨 RLS POLICY VIOLATION DETECTED!');
        console.error('🚨 This means the service role key is NOT being used correctly');
        console.error('🚨 Check:');
        console.error('   1. Is SUPABASE_SERVICE_ROLE_KEY set in Vercel?');
        console.error('   2. Is it the correct service_role key (not anon key)?');
        console.error('   3. Has the project been redeployed after adding the key?');
        return NextResponse.json(
          { 
            error: 'RLS Policy Violation: Service role key may not be configured correctly. Check Vercel logs for details.',
            details: error.message,
            code: error.code,
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create raffle in database',
          code: error.code,
          details: error.details,
        },
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

