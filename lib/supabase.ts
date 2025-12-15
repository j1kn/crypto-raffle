import { createClient } from '@supabase/supabase-js';

// Client-side: use NEXT_PUBLIC_ variables
// Server-side: fallback to non-prefixed variables
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
};

const getSupabaseKey = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseKey();

// Create client with fallback empty strings to prevent build e
// rrors
// In production, these will be set via environment variables
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Server-side client for admin operations
// REQUIRES SERVICE ROLE KEY to bypass RLS policies
// DO NOT use anon key - it will be blocked by RLS
export const createServerClient = () => {
  // Use SUPABASE_URL (not NEXT_PUBLIC_SUPABASE_URL) for server-side
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
  
  // REQUIRED: Use SERVICE ROLE KEY only (no fallback to anon key)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is REQUIRED for admin operations');
    console.error('❌ Anon key cannot bypass RLS policies');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Anon key will be blocked by RLS.');
  }
  
  if (!url) {
    console.error('❌ SUPABASE_URL is not set');
    throw new Error('Supabase URL not configured');
  }
  
  console.log('✅ Creating Supabase client with SERVICE ROLE KEY:', {
    url: url.substring(0, 30) + '...',
    hasServiceRoleKey: true,
  });
  
  // Create client with SERVICE ROLE KEY (bypasses all RLS policies)
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

