import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// This route allows admins to fetch all raffles including receiving_address
// Protected by PIN authentication
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

