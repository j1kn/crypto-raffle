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

// Create client with fallback empty strings to prevent build errors
// In production, these will be set via environment variables
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Server-side client for admin operations
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key);
};

