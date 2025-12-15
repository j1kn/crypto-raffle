import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Test endpoint to verify service role key is working
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      hasSUPABASE_URL: !!process.env.SUPABASE_URL,
      hasNEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'MISSING',
    };

    // Try to create client
    let supabase;
    try {
      supabase = createServerClient();
    } catch (clientError: any) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create Supabase client',
        details: clientError.message,
        envCheck,
      }, { status: 500 });
    }

    // Try a simple query to verify RLS is bypassed
    const { data, error } = await supabase
      .from('raffles')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's an RLS error
      if (error.message?.includes('row-level security') || error.message?.includes('RLS') || error.code === '42501') {
        return NextResponse.json({
          success: false,
          error: 'RLS Policy Violation',
          message: 'Service role key is NOT bypassing RLS. Check your key configuration.',
          details: error.message,
          code: error.code,
          envCheck,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        code: error.code,
        envCheck,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service role key is working correctly! RLS is bypassed.',
      envCheck,
      testQuery: 'Success',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

