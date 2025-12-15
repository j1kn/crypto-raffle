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
// Uses SERVICE ROLE KEY to bypass RLS policies
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://puofbkubhtkynvdlwquu.supabase.co';
  // Use SERVICE ROLE KEY for admin operations (bypasses RLS)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const key = serviceRoleKey || anonKey || '';
  
  if (!key) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is not set');
    throw new Error('Supabase credentials not configured');
  }
  
  if (!serviceRoleKey && anonKey) {
    console.warn('⚠️ Using anon key instead of service role key - RLS policies may block operations');
  }
  
  if (!url) {
    console.error('❌ SUPABASE_URL is not set');
    throw new Error('Supabase URL not configured');
  }
  
  console.log('✅ Creating Supabase client:', {
    url: url.substring(0, 30) + '...',
    hasServiceRoleKey: !!serviceRoleKey,
    hasAnonKey: !!anonKey,
  });
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

