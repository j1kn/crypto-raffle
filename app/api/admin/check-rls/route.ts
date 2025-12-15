import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check RLS status and test insert
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // Check environment variables
    const envStatus = {
      hasSUPABASE_URL: !!supabaseUrl,
      hasSUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey,
      hasSUPABASE_ANON_KEY: !!anonKey,
      serviceRoleKeyLength: serviceRoleKey?.length || 0,
      serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'MISSING',
    };

    // Test with service role key
    let serviceRoleTest = null;
    if (serviceRoleKey) {
      try {
        const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        
        // Try to query
        const { data: queryData, error: queryError } = await supabaseService
          .from('raffles')
          .select('id')
          .limit(1);
        
        // Try to insert a test row (then delete it)
        const testData = {
          title: 'RLS_TEST_' + Date.now(),
          prize_pool_amount: 0,
          prize_pool_symbol: 'ETH',
          ticket_price: 0,
          max_tickets: 1,
          status: 'draft',
          receiving_address: '0x0000000000000000000000000000000000000000',
          ends_at: new Date(Date.now() + 86400000).toISOString(),
        };
        
        const { data: insertData, error: insertError } = await supabaseService
          .from('raffles')
          .insert(testData)
          .select()
          .single();
        
        if (insertData) {
          // Delete the test row
          await supabaseService.from('raffles').delete().eq('id', insertData.id);
        }
        
        serviceRoleTest = {
          success: !insertError,
          queryWorks: !queryError,
          insertWorks: !insertError,
          error: insertError?.message || queryError?.message,
          errorCode: insertError?.code || queryError?.code,
        };
      } catch (err: any) {
        serviceRoleTest = {
          success: false,
          error: err.message,
        };
      }
    }

    // Test with anon key
    let anonKeyTest = null;
    if (anonKey) {
      try {
        const supabaseAnon = createClient(supabaseUrl, anonKey);
        
        const { data, error } = await supabaseAnon
          .from('raffles')
          .select('id')
          .limit(1);
        
        anonKeyTest = {
          queryWorks: !error,
          error: error?.message,
          errorCode: error?.code,
        };
      } catch (err: any) {
        anonKeyTest = {
          error: err.message,
        };
      }
    }

    // Check RLS status via SQL (if we can)
    let rlsStatus = null;
    if (serviceRoleKey) {
      try {
        const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        
        const { data: rlsData, error: rlsError } = await supabaseService.rpc('exec_sql', {
          sql: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'raffles';`
        }).catch(() => ({ data: null, error: { message: 'Cannot check RLS via RPC' } }));
        
        if (!rlsError && rlsData) {
          rlsStatus = rlsData;
        } else {
          // Try direct query
          const { data: directData } = await supabaseService
            .from('pg_tables')
            .select('tablename, rowsecurity')
            .eq('tablename', 'raffles')
            .single()
            .catch(() => ({ data: null }));
          
          rlsStatus = directData || { note: 'Cannot query pg_tables directly' };
        }
      } catch (err: any) {
        rlsStatus = { error: err.message };
      }
    }

    return NextResponse.json({
      environment: envStatus,
      serviceRoleKeyTest: serviceRoleTest,
      anonKeyTest: anonKeyTest,
      rlsStatus: rlsStatus,
      recommendations: getRecommendations(envStatus, serviceRoleTest, anonKeyTest),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

function getRecommendations(env: any, serviceTest: any, anonTest: any) {
  const recommendations = [];
  
  if (!env.hasSUPABASE_SERVICE_ROLE_KEY) {
    recommendations.push('Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables');
  }
  
  if (serviceTest && !serviceTest.insertWorks) {
    if (serviceTest.errorCode === '42501' || serviceTest.error?.includes('row-level security')) {
      recommendations.push('RLS is still enabled. Run: ALTER TABLE raffles DISABLE ROW LEVEL SECURITY; in Supabase SQL Editor');
    } else {
      recommendations.push(`Service role key test failed: ${serviceTest.error}`);
    }
  }
  
  if (serviceTest && serviceTest.insertWorks) {
    recommendations.push('✅ Service role key is working! RLS is bypassed.');
  }
  
  return recommendations;
}

