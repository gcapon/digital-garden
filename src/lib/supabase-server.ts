import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side client with service role for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to get user from cookies/session
export async function getUserFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  
  // Parse the cookie to get Supabase session
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const supabaseSessionCookie = cookies['sb-access-token'];
  if (!supabaseSessionCookie) return null;
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseSessionCookie);
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}