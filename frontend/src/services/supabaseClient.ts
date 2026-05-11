import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kiểm tra xem URL có hợp lệ không (phải bắt đầu bằng http hoặc https)
const getSupabaseUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // If it's just a project ID, construct the standard Supabase URL
  return `https://${url}.supabase.co`;
};

const finalSupabaseUrl = getSupabaseUrl(supabaseUrl);

if (!finalSupabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase Error: Environment variables are missing or invalid.\n' +
    'Current VITE_SUPABASE_URL: ' + (supabaseUrl || 'EMPTY') + '\n' +
    'Please check your .env file.'
  );
} else {
  console.log('Supabase Initialized with URL:', finalSupabaseUrl);
}

export const supabase = finalSupabaseUrl && supabaseAnonKey
  ? createClient(finalSupabaseUrl, supabaseAnonKey)
  : null;
