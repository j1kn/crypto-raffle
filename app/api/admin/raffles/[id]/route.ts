import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET single raffle for admin (includes receiving_address)
// Protected by PIN authentication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    // Handle both sync and async params (Next.js 14+ compatibility)
    const resolvedParams = 'then' in params ? await params : params;
    const raffleId = resolvedParams.id;

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();

    if (error) throw error;

    return NextResponse.json({ raffle: data });
  } catch (error: any) {
    console.error('Error fetching raffle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update raffle
// Protected by PIN authentication
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    const body = await request.json();
    
    // Handle both sync and async params (Next.js 14+ compatibility)
    const resolvedParams = 'then' in params ? await params : params;
    const raffleId = resolvedParams.id;
    
    // Use service role key to bypass RLS (same as create endpoint)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const isFeatured = body.is_featured === true || body.is_featured === 'true' || false;
    const isLive = body.status === 'live';

    // Hero Raffle Validation: Ensure only one live featured raffle exists
    // If this raffle is being set as featured AND live, unfeature all other live raffles
    if (isFeatured && isLive) {
      console.log('🎯 Updating raffle to hero - unfeaturing other live raffles...');
      
      // Find all other live raffles that are currently featured (excluding this one)
      const { data: existingFeatured, error: featuredCheckError } = await supabase
        .from('raffles')
        .select('id, title')
        .eq('status', 'live')
        .eq('is_featured', true)
        .neq('id', raffleId);
      
      if (featuredCheckError) {
        console.error('Error checking existing featured raffles:', featuredCheckError);
      } else if (existingFeatured && existingFeatured.length > 0) {
        console.log(`Found ${existingFeatured.length} existing featured raffle(s), unfeaturing them...`);
        
        // Unfeature all other live raffles (excluding this one)
        const { error: unfeatureError } = await supabase
          .from('raffles')
          .update({ is_featured: false })
          .eq('status', 'live')
          .eq('is_featured', true)
          .neq('id', raffleId);
        
        if (unfeatureError) {
          console.error('Error unfeaturing existing raffles:', unfeatureError);
          // Continue anyway - this is not critical
        } else {
          console.log('✅ Successfully unfeatured existing hero raffles');
        }
      }
    }
    
    const { error } = await supabase
      .from('raffles')
      .update({
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        image_url_portrait: body.image_url_portrait,
        prize_pool_amount: body.prize_pool_amount,
        prize_pool_symbol: body.prize_pool_symbol,
        ticket_price: body.ticket_price,
        max_tickets: body.max_tickets,
        status: body.status,
        chain_uuid: body.chain_uuid,
        receiving_address: body.receiving_address,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        is_featured: isFeatured,
      })
      .eq('id', raffleId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating raffle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE raffle
// Protected by PIN authentication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    // Handle both sync and async params (Next.js 14+ compatibility)
    const resolvedParams = 'then' in params ? await params : params;
    const raffleId = resolvedParams.id;

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', raffleId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting raffle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
