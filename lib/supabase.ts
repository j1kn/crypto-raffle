import { createClient } from '@supabase/supabase-js';

// Client-side: use NEXT_PUBLIC_ variables
// Server-side: fallback to non-prefixed variables
const supabaseUrl = 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    : (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '');
    
const supabaseAnonKey = 
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
    : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '');

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    console.error('Missing Supabase environment variables');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client for admin operations
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return createClient(url, key);
};

