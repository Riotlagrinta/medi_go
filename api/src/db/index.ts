import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for raw queries if needed (via RPC or specific client methods)
export const query = async (text: string, params?: any[]) => {
  // Note: Supabase client doesn't use raw SQL strings directly for security.
  // We will mostly use the client's builder pattern.
  // For complex PostGIS queries, we might need to use RPC (Database Functions).
  return { rows: [] }; 
};

export default supabase;