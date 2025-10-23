import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined in .env file');
  console.error('Create a .env file in your project root with:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in .env file');
  console.error('Add to your .env file:');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log successful connection (only in development)
if (import.meta.env.DEV) {
  console.log('✅ Supabase client initialized');
  console.log('📡 URL:', supabaseUrl);
}