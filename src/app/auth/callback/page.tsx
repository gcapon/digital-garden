'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token=')) {
        // No tokens in hash - try exchangeCodeForSession (email confirmation flow)
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error || !data.session) {
            router.push('/login?error=callback_error');
          } else {
            router.push('/admin');
          }
        } else {
          router.push('/login?error=no_session');
        }
        return;
      }

      // Parse tokens from URL hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        router.push('/login?error=no_session');
        return;
      }

      // Set the session in Supabase client
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) {
        console.error('setSession error:', error);
        router.push('/login?error=callback_error');
        return;
      }

      // Also set cookies explicitly so the Next.js middleware can read them
      // The sb-access-token cookie is what the middleware looks for
      document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax; secure`;
      if (refreshToken) {
        document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax; secure`;
      }

      router.push('/admin');
    };

    handleAuth();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FDFAF4',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#2D2A24', fontSize: '16px' }}>Logging you in…</p>
      </div>
    </div>
  );
}
