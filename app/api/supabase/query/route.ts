import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyMjI5OCwiZXhwIjoyMDgxMDk4Mjk4fQ.n4v52beF3ta0feTVsZoSnJpbsenoYWEgh2c_poF1I48';

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, table, data, filters, sql } = body;

    switch (action) {
      case 'query':
        if (sql) {
          // Execute raw SQL
          const { data: result, error } = await supabase.rpc('exec_sql', { sql }).catch(() => {
            // If RPC doesn't exist, try direct query
            return { data: null, error: { message: 'SQL execution not available via RPC' } };
          });
          
          if (error) throw error;
          return NextResponse.json({ success: true, data: result });
        } else if (table) {
          // Query table
          let query = supabase.from(table).select('*');
          
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          
          const { data: result, error } = await query;
          if (error) throw error;
          return NextResponse.json({ success: true, data: result });
        }
        break;

      case 'insert':
        if (!table || !data) {
          return NextResponse.json({ error: 'Table and data required' }, { status: 400 });
        }
        const { data: inserted, error: insertError } = await supabase
          .from(table)
          .insert(data)
          .select();
        if (insertError) throw insertError;
        return NextResponse.json({ success: true, data: inserted });

      case 'update':
        if (!table || !data.id || !data) {
          return NextResponse.json({ error: 'Table, id, and data required' }, { status: 400 });
        }
        const { id, ...updateData } = data;
        const { data: updated, error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
          .select();
        if (updateError) throw updateError;
        return NextResponse.json({ success: true, data: updated });

      case 'delete':
        if (!table || !data.id) {
          return NextResponse.json({ error: 'Table and id required' }, { status: 400 });
        }
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Supabase query error:', error);
    return NextResponse.json(
      { error: error.message || 'Query failed' },
      { status: 500 }
    );
  }
}

