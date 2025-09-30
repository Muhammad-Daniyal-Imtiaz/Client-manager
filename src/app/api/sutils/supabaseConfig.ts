// src/app/api/sutils/supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey && !supabaseServiceKey) {
  throw new Error('Missing environment variables: Either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is required');
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);