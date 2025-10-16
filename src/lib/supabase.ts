import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return url && 
         url !== 'your_supabase_url_here' &&
         url.startsWith('http') &&
         key && 
         key !== 'your_supabase_anon_key_here';
}

// Lazy client creation - only create when Supabase is configured
let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

// Storage bucket name
export const STORAGE_BUCKET = 'images'