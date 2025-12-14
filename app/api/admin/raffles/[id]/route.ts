import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET single raffle for admin (includes receiving_address)
// Protected by PIN authentication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    // Note: In production, use service role key here to bypass RLS
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    const body = await request.json();
    
    // Note: In production, use service role key here to bypass RLS
    const supabase = createServerClient();
    
    const { error } = await supabase
      .from('raffles')
      .update({
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        prize_pool_amount: body.prize_pool_amount,
        prize_pool_symbol: body.prize_pool_symbol,
        ticket_price: body.ticket_price,
        max_tickets: body.max_tickets,
        status: body.status,
        chain_uuid: body.chain_uuid,
        receiving_address: body.receiving_address,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
      })
      .eq('id', params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin PIN is configured
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 });
    }

    // Note: In production, use service role key here to bypass RLS
    const supabase = createServerClient();
    
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting raffle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
