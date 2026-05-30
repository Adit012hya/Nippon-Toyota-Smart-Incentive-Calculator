import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const PLACEHOLDER_URL = 'https://your-project-id.supabase.co';
const PLACEHOLDER_KEY = 'your-anon-key-here';

export const supabaseConfigMessage =
  'Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Supabase Dashboard → Settings → API.';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== PLACEHOLDER_URL &&
    supabaseAnonKey !== PLACEHOLDER_KEY
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
}

export const supabase = client;

export function requireSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(supabaseConfigMessage);
  }
  return client;
}
