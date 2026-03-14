import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/profile?walletAddress=0x...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      // If profile doesn't exist, return null (not an error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ profile: null });
      }
      throw error;
    }

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/profile - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, displayName, email, profilePictureUrl } = body;

    if (!walletAddress || !displayName) {
      return NextResponse.json(
        { error: 'walletAddress and displayName are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // First, ensure user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create them first
      const { error: insertUserError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress });

      if (insertUserError) {
        throw insertUserError;
      }
    } else if (userError) {
      throw userError;
    }

    // Upsert profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          wallet_address: walletAddress,
          display_name: displayName,
          email: email || null,
          profile_picture_url: profilePictureUrl || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'wallet_address',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update profile', details: error.message },
      { status: 500 }
    );
  }
}

